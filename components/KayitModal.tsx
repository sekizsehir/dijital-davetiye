'use client'

import { useState, useEffect } from 'react'
import { iller, illerListesi } from '@/lib/iller'

interface Davetli {
  id: number
  kod: string
  ad: string
  soyad: string
  il: string | null
  ilce: string | null
  email: string | null
  katilimVar: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  onKaydet: () => void
  duzenle?: Davetli | null  // null = yeni kayıt, dolu = düzenleme
}

export default function KayitModal({ open, onClose, onKaydet, duzenle }: Props) {
  const [ad, setAd] = useState('')
  const [soyad, setSoyad] = useState('')
  const [il, setIl] = useState('')
  const [ilce, setIlce] = useState('')
  const [email, setEmail] = useState('')
  const [katilimVar, setKatilimVar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hata, setHata] = useState('')

  const yeniKayit = !duzenle

  useEffect(() => {
    if (duzenle) {
      setAd(duzenle.ad)
      setSoyad(duzenle.soyad)
      setIl(duzenle.il || '')
      setIlce(duzenle.ilce || '')
      setEmail(duzenle.email || '')
      setKatilimVar(duzenle.katilimVar)
    } else {
      setAd('')
      setSoyad('')
      setIl('')
      setIlce('')
      setEmail('')
      setKatilimVar(false)
    }
    setHata('')
  }, [duzenle, open])

  useEffect(() => { setIlce('') }, [il])

  if (!open) return null

  const ilceler = il ? (iller[il] || []) : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setHata('')

    try {
      const url = '/api/admin/kayit'
      const method = yeniKayit ? 'POST' : 'PUT'
      const body = yeniKayit
        ? { ad, soyad, il, ilce, email }
        : { id: duzenle!.id, ad, soyad, il, ilce, email, katilimVar }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setHata(data.error || 'Bir hata oluştu')
        return
      }

      onKaydet()
      onClose()
    } catch {
      setHata('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-lg text-gray-800">
              {yeniKayit ? 'Yeni Kayıt Oluştur' : 'Kaydı Düzenle'}
            </h2>
            {!yeniKayit && (
              <p className="text-xs text-gray-400 mt-0.5 font-mono">Kod: {duzenle!.kod}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={ad}
                onChange={e => setAd(e.target.value.toUpperCase())}
                required
                placeholder="AHMET"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soyad <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={soyad}
                onChange={e => setSoyad(e.target.value.toUpperCase())}
                required
                placeholder="YILMAZ"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İl</label>
              <select
                value={il}
                onChange={e => setIl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="">Seçiniz</option>
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
                disabled={!il}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">Seçiniz</option>
                {ilceler.map(ilceAdi => (
                  <option key={ilceAdi} value={ilceAdi}>{ilceAdi}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* Sadece düzenleme modunda katılım durumu göster */}
          {!yeniKayit && (
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 border border-gray-200">
              <label className="text-sm font-medium text-gray-700">Katılım Durumu</label>
              <button
                type="button"
                onClick={() => setKatilimVar(v => !v)}
                className="relative w-12 h-6 rounded-full transition"
                style={{ background: katilimVar ? '#22c55e' : '#d1d5db' }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                  style={{ left: katilimVar ? '26px' : '2px' }}
                />
              </button>
            </div>
          )}

          {hata && <p className="text-red-600 text-sm">{hata}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition"
              style={{ background: '#CC0000', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Kaydediliyor...' : yeniKayit ? 'Kayıt Oluştur' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
