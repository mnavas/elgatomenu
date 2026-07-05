'use client'

import Link from 'next/link'

interface Props {
  nameConfigured: boolean
  menuHasItems: boolean
}

export default function SetupChecklist({ nameConfigured, menuHasItems }: Props) {
  const steps = [
    {
      done: nameConfigured,
      href: '/dashboard/settings',
      icon: '✏️',
      title: 'Configura tu restaurante',
      desc: 'Ponle nombre a tu restaurante y configura cómo te pagan los clientes.',
    },
    {
      done: menuHasItems,
      href: '/dashboard/menu',
      icon: '🍽️',
      title: 'Crea tu carta',
      desc: 'Agrega categorías y platos con precios y fotos.',
    },
    {
      done: false,
      href: '/dashboard/share',
      icon: '📱',
      title: 'Comparte el menú con tus clientes',
      desc: 'Imprime el código QR y colócalo en las mesas.',
    },
  ]
  const firstPending = steps.findIndex(s => !s.done)

  return (
    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5 space-y-3">
      <div>
        <h2 className="font-bold text-zinc-900">👋 ¡Bienvenido! Prepara tu restaurante</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Sigue estos pasos para empezar a recibir pedidos.
        </p>
      </div>
      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-colors ${
                i === firstPending
                  ? 'border-emerald-400 shadow-sm hover:border-emerald-500'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  step.done ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {step.done ? '✓' : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${step.done ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>
                  {step.icon} {step.title}
                </p>
                {!step.done && (
                  <p className="text-xs text-zinc-500 mt-0.5">{step.desc}</p>
                )}
              </div>
              <span className="text-zinc-300">›</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
