import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/server'
import { clearRestaurantCache } from '@/lib/restaurant'
import { NextRequest } from 'next/server'

const BUCKET = 'menu-images'
const QR_COLUMNS = { deuna: 'deuna_qr_url', sipi: 'sipi_qr_url' } as const

type QrMethod = keyof typeof QR_COLUMNS

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function ensureBucket(supabase: ReturnType<typeof createServiceClient>) {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  })
  // Ignore error if bucket already exists
  if (error && !error.message.includes('already exists')) {
    throw error
  }
}

function parseMethod(raw: unknown): QrMethod | null {
  return raw === 'deuna' || raw === 'sipi' ? raw : null
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const method = parseMethod(formData.get('method'))
  if (!method) return Response.json({ error: 'Invalid payment method' }, { status: 400 })
  const file = formData.get('image') as File | null
  if (!file) return Response.json({ error: 'No image provided' }, { status: 400 })

  const supabase = createServiceClient()

  try {
    await ensureBucket(supabase)
  } catch (e) {
    return Response.json({ error: `Storage bucket error: ${(e as Error).message}` }, { status: 500 })
  }

  const storagePath = `payment-qr/${method}`
  const bytes = await file.arrayBuffer()

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType: file.type, upsert: true })

  if (uploadErr) return Response.json({ error: uploadErr.message }, { status: 500 })

  // Build public URL using the browser-accessible base URL (not the internal Docker URL)
  const publicBase = process.env.NEXT_PUBLIC_SUPABASE_URL
  const qrUrl = `${publicBase}/storage/v1/object/public/${BUCKET}/${storagePath}?t=${Date.now()}`

  const { error: updateErr } = await supabase
    .from('restaurant')
    .update({ [QR_COLUMNS[method]]: qrUrl })
    .select()

  if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 })

  clearRestaurantCache()
  return Response.json({ qr_url: qrUrl })
}

export async function DELETE(req: NextRequest) {
  const user = await getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const method = parseMethod(req.nextUrl.searchParams.get('method'))
  if (!method) return Response.json({ error: 'Invalid payment method' }, { status: 400 })

  const supabase = createServiceClient()

  // Remove from storage (best effort — don't fail if not found)
  await supabase.storage.from(BUCKET).remove([`payment-qr/${method}`])

  const { error } = await supabase
    .from('restaurant')
    .update({ [QR_COLUMNS[method]]: null })
    .select()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  clearRestaurantCache()
  return new Response(null, { status: 204 })
}
