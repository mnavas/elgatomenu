'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      showToast({ text: 'Correo o contraseña incorrectos', type: 'error' })
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  // Self-hosted installs have no email server, so recovery happens from the
  // server's terminal instead of a reset-by-email flow.
  if (mode === 'reset') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900">Recuperar contraseña</h1>
            <p className="mt-1 text-sm text-zinc-500">Se hace desde el computador del restaurante</p>
          </div>
          <div className="space-y-3 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
            <p>
              En el computador donde está instalado ElGatoMenu, abre una terminal
              en la carpeta <strong>elgatomenu</strong> y ejecuta:
            </p>
            <pre className="overflow-x-auto rounded-lg bg-zinc-900 px-3 py-2 font-mono text-xs text-emerald-300">./elgatomenu reset-password</pre>
            <p>
              Te pedirá el correo de la cuenta y la nueva contraseña.
              En Windows el comando es <span className="font-mono text-xs">elgatomenu reset-password</span>.
            </p>
          </div>
          <p className="text-center">
            <button onClick={() => setMode('login')} className="text-sm text-zinc-500 hover:text-zinc-700 underline">
              Volver al inicio de sesión
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Acceso restaurante</h1>
          <p className="mt-1 text-sm text-zinc-500">Panel del propietario</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Correo electrónico"
            aria-label="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            aria-label="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <Button type="submit" loading={loading} className="w-full">
            Ingresar
          </Button>
        </form>
        <p className="text-center">
          <button onClick={() => setMode('reset')} className="text-sm text-zinc-500 hover:text-zinc-700 underline">
            ¿Olvidaste tu contraseña?
          </button>
        </p>
      </div>
    </div>
  )
}
