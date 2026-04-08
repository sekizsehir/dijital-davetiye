'use client'

import { useState } from 'react'
import DavetiyeKart, { OverlayAyar, VARSAYILAN_AYAR } from './DavetiyeKart'

interface Props {
  open: boolean
  onClose: () => void
  mevcutAyar: OverlayAyar
  onKaydet: (ayar: OverlayAyar) => void
}

export default function OverlayAyarModal({ open, onClose, mevcutAyar, onKaydet }: Props) {
  const [ayar, setAyar] = useState<OverlayAyar>(mevcutAyar)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [mesaj, setMesaj] = useState('')

  if (!open) return null

  function guncelle(key: keyof OverlayAyar, val: string) {
    setAyar(prev => ({ ...prev, [key]: val }))
  }

  async function kaydet() {
    setKaydediliyor(true)
    setMesaj('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ayar),
      })
      if (res.ok) {
        setMesaj('✓ Ayarlar kaydedildi')
        onKaydet(ayar)
      } else {
        setMesaj('✗ Kaydetme hatası')
      }
    } catch {
      setMesaj('✗ Bağlantı hatası')
    } finally {
      setKaydediliyor(false)
    }
  }

  function sifirla() {
    setAyar(VARSAYILAN_AYAR)
  }

  const fontWeightSecenekler = [
    { label: 'İnce (300)', value: '300' },
    { label: 'Normal (400)', value: '400' },
    { label: 'Orta (500)', value: '500' },
    { label: 'Kalın (600)', value: '600' },
    { label: 'Daha Kalın (700)', value: '700' },
    { label: 'Çok Kalın (800)', value: '800' },
    { label: 'Siyah (900)', value: '900' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-800">Ad/Soyad Yazı Ayarları</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="flex flex-col md:flex-row overflow-auto flex-1">
          {/* Sol: Kontroller */}
          <div className="w-full md:w-80 p-6 border-r border-gray-100 space-y-5 overflow-y-auto shrink-0">

            {/* Dikey Pozisyon */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">Dikey Pozisyon</label>
                <span className="text-sm text-gray-500">{ayar.overlay_top}%</span>
              </div>
              <input
                type="range" min="20" max="80" step="0.5"
                value={ayar.overlay_top}
                onChange={e => guncelle('overlay_top', e.target.value)}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Üst</span><span>Alt</span>
              </div>
            </div>

            {/* Yatay Pozisyon */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">Yatay Pozisyon</label>
                <span className="text-sm text-gray-500">{ayar.overlay_left}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="1"
                value={ayar.overlay_left}
                onChange={e => guncelle('overlay_left', e.target.value)}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Sol</span><span>Sağ</span>
              </div>
            </div>

            {/* Yazı Boyutu */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">Yazı Boyutu</label>
                <span className="text-sm text-gray-500">{ayar.overlay_fontsize}px</span>
              </div>
              <input
                type="range" min="8" max="48" step="1"
                value={ayar.overlay_fontsize}
                onChange={e => guncelle('overlay_fontsize', e.target.value)}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Küçük</span><span>Büyük</span>
              </div>
            </div>

            {/* Yazı Kalınlığı */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Yazı Kalınlığı</label>
              <div className="grid grid-cols-2 gap-1">
                {fontWeightSecenekler.map(s => (
                  <button
                    key={s.value}
                    onClick={() => guncelle('overlay_fontweight', s.value)}
                    className="px-2 py-1.5 rounded-lg text-xs border transition"
                    style={{
                      background: ayar.overlay_fontweight === s.value ? '#CC0000' : '#f9fafb',
                      color: ayar.overlay_fontweight === s.value ? 'white' : '#374151',
                      borderColor: ayar.overlay_fontweight === s.value ? '#CC0000' : '#e5e7eb',
                      fontWeight: Number(s.value),
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Harf Aralığı */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">Harf Aralığı</label>
                <span className="text-sm text-gray-500">{ayar.overlay_letterspacing}em</span>
              </div>
              <input
                type="range" min="0" max="0.5" step="0.01"
                value={ayar.overlay_letterspacing}
                onChange={e => guncelle('overlay_letterspacing', e.target.value)}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Sıkışık</span><span>Geniş</span>
              </div>
            </div>

            {/* Yazı Rengi */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Yazı Rengi</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={ayar.overlay_color}
                  onChange={e => guncelle('overlay_color', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={ayar.overlay_color}
                  onChange={e => guncelle('overlay_color', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              {/* Hızlı renk seçenekleri */}
              <div className="flex gap-2 mt-2">
                {['#ffffff', '#000000', '#FFD700', '#CC0000', '#1a1a1a'].map(r => (
                  <button
                    key={r}
                    onClick={() => guncelle('overlay_color', r)}
                    title={r}
                    className="w-8 h-8 rounded-full border-2 transition"
                    style={{
                      background: r,
                      borderColor: ayar.overlay_color === r ? '#CC0000' : '#e5e7eb',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Gölge */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Yazı Gölgesi</label>
              <button
                onClick={() => guncelle('overlay_textshadow', ayar.overlay_textshadow === '1' ? '0' : '1')}
                className="relative w-12 h-6 rounded-full transition"
                style={{ background: ayar.overlay_textshadow === '1' ? '#CC0000' : '#d1d5db' }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                  style={{ left: ayar.overlay_textshadow === '1' ? '26px' : '2px' }}
                />
              </button>
            </div>
          </div>

          {/* Sağ: Canlı Önizleme */}
          <div className="flex-1 p-6 bg-gray-900 flex flex-col items-center justify-center min-h-64 overflow-y-auto">
            <p className="text-gray-400 text-xs mb-4 uppercase tracking-widest">Canlı Önizleme</p>
            <div className="w-full max-w-xs">
              <DavetiyeKart ad="ÖMER" soyad="ŞİRANLI" ayar={ayar} />
            </div>
          </div>
        </div>

        {/* Alt butonlar */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={sifirla}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 transition"
          >
            Varsayılana Sıfırla
          </button>
          {mesaj && (
            <span className={`text-sm font-medium ${mesaj.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
              {mesaj}
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 transition">
              Kapat
            </button>
            <button
              onClick={kaydet}
              disabled={kaydediliyor}
              className="px-6 py-2 rounded-lg text-sm text-white font-bold transition"
              style={{ background: '#CC0000', opacity: kaydediliyor ? 0.7 : 1 }}
            >
              {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
