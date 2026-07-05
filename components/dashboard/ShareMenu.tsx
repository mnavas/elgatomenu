'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { showToast } from '@/components/ui/Toast'

interface Props {
  restaurantName: string
  appUrl: string
}

export default function ShareMenu({ restaurantName, appUrl }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    QRCode.toDataURL(appUrl, { width: 480, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => showToast({ text: 'No se pudo generar el código QR', type: 'error' }))
  }, [appUrl])

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(appUrl)
      showToast({ text: 'Enlace copiado', type: 'success' })
    } catch {
      showToast({ text: 'No se pudo copiar. Copia el enlace manualmente.', type: 'error' })
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-4 print:hidden">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Dashboard
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">Compartir menú</h1>
      </div>

      <p className="text-sm text-zinc-600 print:hidden">
        Tus clientes deben estar conectados al <strong>WiFi del restaurante</strong>.
        Imprime este código QR y colócalo en las mesas — al escanearlo se abre el menú.
      </p>

      {/* Printable card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center space-y-4 print:border-0">
        <h2 className="text-2xl font-bold text-zinc-900">{restaurantName}</h2>
        <p className="text-sm text-zinc-500">Escanea para ver el menú y pedir</p>
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt={`Código QR del menú de ${restaurantName}`}
            className="mx-auto h-64 w-64"
          />
        ) : (
          <div className="mx-auto h-64 w-64 animate-pulse rounded-xl bg-zinc-100" />
        )}
        <p className="font-mono text-sm text-zinc-600 break-all">{appUrl}</p>
      </div>

      <div className="flex gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex-1 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          🖨️ Imprimir
        </button>
        <button
          type="button"
          onClick={copyUrl}
          className="flex-1 rounded-xl border-2 border-zinc-200 py-3 font-semibold text-zinc-700 transition-colors hover:border-zinc-300"
        >
          📋 Copiar enlace
        </button>
      </div>

      <div className="rounded-xl bg-zinc-50 p-4 text-xs text-zinc-500 space-y-1 print:hidden">
        <p><strong>Consejos:</strong></p>
        <p>• Imprime varios y pega uno en cada mesa (mejor si están plastificados).</p>
        <p>• Si el enlace deja de funcionar, la dirección IP del computador pudo haber cambiado — pide una IP fija a tu router o proveedor de internet.</p>
      </div>
    </div>
  )
}
