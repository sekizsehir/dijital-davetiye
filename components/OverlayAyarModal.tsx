'use client'

import { useState, useEffect } from 'react'
import DavetiyeKart, { OverlayAyar, VARSAYILAN_AYAR } from './DavetiyeKart'

interface FontItem { dosya: string; ad: string }

interface Props {
  open: boolean
  onClose: () => void
  onKaydet: (ayar: OverlayAyar) => void
}

export default function OverlayAyarModal({ open, onClose, onKaydet }: Props) {
  const [ayar, setAyar] = useState<OverlayAyar>(VARSAYILAN_AYAR)
  const [fontlar, setFontlar] = useState<FontItem[]>([])
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [mesaj, setMesaj] = useState('')

  // Modal açıldığında mevcut ayarları ve fontları yükle
  useEffect(() => {
    if (!open) return
    fetch('/api/ayarlar')
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) setAyar({ ...VARSAYILAN_AYAR, ...data })
      })
      .catch(() => {})
    fetch('/api/admin/fonts')
      .then(r => r.json())
      .then(data => setFontlar(data.fonts || []))
      .catch(() => {})
  }, [open])

  // Seçili font'u tarayıcıya yükle (önizleme için)
  useEffect(() => {
    if (!ayar.overlay_font || ayar.overlay_font === 'inherit') return
    const fontItem = fontlar.find(f => f.ad === ayar.overlay_font)
    const dosya = fontItem ? fontItem.dosya : `${ayar.overlay_font}.ttf`
    const fontUrl = `/fonts/${dosya}`
    const style = document.getElementById('preview-font-style') || document.createElement('style')
    style.id = 'preview-font-style'
    style.textContent = `@font-face { font-family: "${ayar.overlay_font}"; src: url("${fontUrl}"); }`
    document.head.appendChild(style)
  }, [ayar.overlay_font, fontlar])

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

  const hizliRenkler = ['#000000', '#ffffff', '#CC0000', '#1a1a1a', '#FFD700', '#374151']

  const fontWeightler = [
    { label: 'İnce', value: '300' },
    { label: 'Normal', value: '400' },
    { label: 'Orta', value: '500' },
    { label: 'Kalın', value: '600' },
    { label: 'Daha Kalın', value: '700' },
    { label: 'Siyah', value: '900' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl w-full shadow-2xl flex flex-col"
        style={{ maxWidth: '900px', maxHeight: '95vh' }}>

        {/* Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-lg text-gray-800">Ad/Soyad Yazı Ayarları</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="flex flex-col md:flex-row overflow-hidden flex-1 min-h-0">

          {/* Sol: Kontroller */}
          <div className="w-full md:w-72 shrink-0 p-5 border-r border-gray-100 overflow-y-auto space-y-5">

            {/* Dikey Pozisyon */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">Dikey Pozisyon</label>
                <span className="text-sm text-gray-400">{ayar.overlay_top}%</span>
              </div>
              <input type="range" min="5" max="95" step="0.5"
                value={ayar.overlay_top}
                onChange={e => guncelle('overlay_top', e.target.value)}
                className="w-full accent-red-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>Üst</span><span>Alt</span>
              </div>
            </div>

            {/* Yazı Boyutu */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">Yazı Boyutu</label>
                <span className="text-sm text-gray-400">{ayar.overlay_fontsize}px</span>
              </div>
              <input type="range" min="8" max="60" step="1"
                value={ayar.overlay_fontsize}
                onChange={e => guncelle('overlay_fontsize', e.target.value)}
                className="w-full accent-red-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>Küçük</span><span>Büyük</span>
              </div>
            </div>

            {/* Yazı Kalınlığı */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Yazı Kalınlığı</label>
              <div className="grid grid-cols-3 gap-1">
                {fontWeightler.map(fw => (
                  <button key={fw.value} onClick={() => guncelle('overlay_fontweight', fw.value)}
                    className="py-1.5 rounded-lg text-xs border transition"
                    style={{
                      background: ayar.overlay_fontweight === fw.value ? '#CC0000' : '#f9fafb',
                      color: ayar.overlay_fontweight === fw.value ? '#fff' : '#374151',
                      borderColor: ayar.overlay_fontweight === fw.value ? '#CC0000' : '#e5e7eb',
                      fontWeight: Number(fw.value),
                    }}>
                    {fw.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Harf Aralığı */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-semibold text-gray-700">Harf Aralığı</label>
                <span className="text-sm text-gray-400">{ayar.overlay_letterspacing}em</span>
              </div>
              <input type="range" min="0" max="0.5" step="0.01"
                value={ayar.overlay_letterspacing}
                onChange={e => guncelle('overlay_letterspacing', e.target.value)}
                className="w-full accent-red-600" />
            </div>

            {/* Yazı Rengi */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Yazı Rengi</label>
              <div className="flex items-center gap-2 mb-2">
                <input type="color" value={ayar.overlay_color}
                  onChange={e => guncelle('overlay_color', e.target.value)}
                  className="w-10 h-9 rounded cursor-pointer border border-gray-200" />
                <input type="text" value={ayar.overlay_color}
                  onChange={e => guncelle('overlay_color', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div className="flex gap-2">
                {hizliRenkler.map(r => (
                  <button key={r} onClick={() => guncelle('overlay_color', r)}
                    title={r}
                    className="w-7 h-7 rounded-full border-2 transition shrink-0"
                    style={{
                      background: r,
                      borderColor: ayar.overlay_color === r ? '#CC0000' : '#e5e7eb',
                    }} />
                ))}
              </div>
            </div>

            {/* Yazı Gölgesi */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Yazı Gölgesi</label>
              <button onClick={() => guncelle('overlay_textshadow', ayar.overlay_textshadow === '1' ? '0' : '1')}
                className="relative w-12 h-6 rounded-full transition"
                style={{ background: ayar.overlay_textshadow === '1' ? '#CC0000' : '#d1d5db' }}>
                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                  style={{ left: ayar.overlay_textshadow === '1' ? '26px' : '2px' }} />
              </button>
            </div>

            {/* Font Seçimi */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Yazı Fontu</label>
              {fontlar.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-3 border border-dashed border-gray-300">
                  <p className="text-xs text-gray-500 text-center">
                    Font eklemek için <code className="bg-gray-100 px-1 rounded">.ttf</code> dosyalarını
                    <br /><strong>public/fonts/</strong> klasörüne koyun
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <button
                    onClick={() => guncelle('overlay_font', 'inherit')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm border transition"
                    style={{
                      background: (!ayar.overlay_font || ayar.overlay_font === 'inherit') ? '#fef2f2' : '#f9fafb',
                      borderColor: (!ayar.overlay_font || ayar.overlay_font === 'inherit') ? '#CC0000' : '#e5e7eb',
                      color: (!ayar.overlay_font || ayar.overlay_font === 'inherit') ? '#CC0000' : '#374151',
                    }}>
                    Varsayılan Font
                  </button>
                  {fontlar.map(f => (
                    <button key={f.dosya}
                      onClick={() => guncelle('overlay_font', f.ad)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm border transition"
                      style={{
                        fontFamily: `"${f.ad}", sans-serif`,
                        background: ayar.overlay_font === f.ad ? '#fef2f2' : '#f9fafb',
                        borderColor: ayar.overlay_font === f.ad ? '#CC0000' : '#e5e7eb',
                        color: ayar.overlay_font === f.ad ? '#CC0000' : '#374151',
                      }}>
                      {f.ad}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sağ: Canlı Önizleme */}
          <div className="flex-1 p-6 bg-gray-900 flex flex-col items-center justify-center overflow-y-auto">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">Canlı Önizleme</p>
            <div className="w-full max-w-xs">
              <DavetiyeKart ad="AHMET" soyad="YILMAZ" ayar={ayar} />
            </div>
          </div>
        </div>

        {/* Alt butonlar */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <button onClick={() => setAyar(VARSAYILAN_AYAR)}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50">
            Sıfırla
          </button>
          {mesaj && (
            <span className={`text-sm font-medium ${mesaj.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
              {mesaj}
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50">
              Kapat
            </button>
            <button onClick={kaydet} disabled={kaydediliyor}
              className="px-6 py-2 rounded-lg text-sm text-white font-bold"
              style={{ background: '#CC0000', opacity: kaydediliyor ? 0.7 : 1 }}>
              {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
