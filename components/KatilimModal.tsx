'use client'

import { useState, useEffect } from 'react'
import { iller, illerListesi } from '@/lib/iller'

interface KatilimModalProps {
  open: boolean
  onClose: () => void
  kod: string
  initialAd: string
  initialSoyad: string
}

export default function KatilimModal({ open, onClose, kod, initialAd, initialSoyad }: KatilimModalProps) {
  const [ad, setAd] = useState(initialAd)
  const [soyad, setSoyad] = useState(initialSoyad)
  const [il, setIl] = useState('')
  const [ilce, setIlce] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setAd(initialAd)
    setSoyad(initialSoyad)
  }, [initialAd, initialSoyad])

  useEffect(() => {
    setIlce('')
  }, [il])

  if (!open) return null

  const ilceler = il ? (iller[il] || []) : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/katilim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kod, ad, soyad, il, ilce }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Bir hata oluştu')
        return
      }

      setSuccess(true)
    } catch {
      setError('Bağlantı hatası oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-gray-500 font-medium text-lg">Katılım Bildirimi</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Teşekkürler!</h3>
              <p className="text-gray-600">
                Katılım bildiriminiz başarıyla alındı. Etkinliğimizde görüşmek üzere.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 rounded-lg text-white font-medium"
                style={{ background: '#CC0000' }}
              >
                Kapat
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                <input
                  type="text"
                  value={ad}
                  onChange={e => setAd(e.target.value.toUpperCase())}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                <input
                  type="text"
                  value={soyad}
                  onChange={e => setSoyad(e.target.value.toUpperCase())}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
                <select
                  value={il}
                  onChange={e => setIl(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white"
                >
                  <option value="">İl seçiniz</option>
                  {illerListesi.map(ilAdi => (
                    <option key={ilAdi} value={ilAdi}>{ilAdi}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                <select
                  value={ilce}
                  onChange={e => setIlce(e.target.value)}
                  required
                  disabled={!il}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">İlçe seçiniz</option>
                  {ilceler.map(ilceAdi => (
                    <option key={ilceAdi} value={ilceAdi}>{ilceAdi}</option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-base transition-opacity"
                style={{ background: '#CC0000', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Gönderiliyor...' : 'Katılım Bildirimini Gönder'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
