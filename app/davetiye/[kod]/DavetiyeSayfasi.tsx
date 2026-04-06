'use client'

import { useState } from 'react'
import DavetiyeKart from '@/components/DavetiyeKart'
import KatilimModal from '@/components/KatilimModal'

interface Props {
  kod: string
  ad: string
  soyad: string
  katilimVar: boolean
}

export default function DavetiyeSayfasi({ kod, ad, soyad, katilimVar: initialKatilim }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [katilimVar, setKatilimVar] = useState(initialKatilim)
  const [indiriliyor, setIndiriliyor] = useState(false)

  async function handleIndir() {
    setIndiriliyor(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const element = document.getElementById('davetiye-kart')
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })

      const link = document.createElement('a')
      link.download = `davetiye-${ad}-${soyad}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('İndirme hatası:', err)
    } finally {
      setIndiriliyor(false)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center py-8 px-4"
      style={{ background: '#1a1a1a' }}
    >
      <div className="w-full max-w-md">
        <DavetiyeKart ad={ad} soyad={soyad} />

        <div className="mt-6 space-y-3">
          {katilimVar ? (
            <div
              className="w-full py-4 rounded-xl text-center text-white font-bold"
              style={{ background: '#22c55e' }}
            >
              ✓ Katılım Bildiriminiz Alındı
            </div>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-4 rounded-xl text-white font-bold text-base transition-transform active:scale-95"
              style={{ background: 'linear-gradient(135deg, #6B21A8, #4C1D95)' }}
            >
              Katılım Bildirimi İçin Tıklayınız
            </button>
          )}

          <button
            onClick={handleIndir}
            disabled={indiriliyor}
            className="w-full py-4 rounded-xl text-white font-bold text-base transition-transform active:scale-95"
            style={{ background: '#CC0000', opacity: indiriliyor ? 0.7 : 1 }}
          >
            {indiriliyor ? 'İndiriliyor...' : 'İndirmek İçin Tıklayınız'}
          </button>
        </div>
      </div>

      <KatilimModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setKatilimVar(true)
        }}
        kod={kod}
        initialAd={ad}
        initialSoyad={soyad}
      />
    </main>
  )
}
