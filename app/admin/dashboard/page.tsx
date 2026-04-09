'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import OverlayAyarModal from '@/components/OverlayAyarModal'
import { OverlayAyar, VARSAYILAN_AYAR } from '@/components/DavetiyeKart'
import KayitModal from '@/components/KayitModal'

interface Davetli {
  id: number
  kod: string
  ad: string
  soyad: string
  il: string | null
  ilce: string | null
  email: string | null
  telefon: string | null
  katilimVar: boolean
  olusturmaTarihi: string
}

export default function AdminDashboard() {
  const [davetliler, setDavetliler] = useState<Davetli[]>([])
  const [toplam, setToplam] = useState(0)
  const [katilimYapan, setKatilimYapan] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('')
  const [arama, setArama] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMesaj, setImportMesaj] = useState('')
  const [kopyalandi, setKopyalandi] = useState<number | null>(null)
  const [ayarModalAcik, setAyarModalAcik] = useState(false)
  const [overlayAyar, setOverlayAyar] = useState<OverlayAyar>(VARSAYILAN_AYAR)
  const [secili, setSecili] = useState<Set<number>>(new Set())
  const [siliniyor, setSiliniyor] = useState(false)
  const [onayModal, setOnayModal] = useState<{ tip: 'tek' | 'toplu'; id?: number; sayi?: number } | null>(null)
  const [kayitModal, setKayitModal] = useState(false)
  const [duzenleKayit, setDuzenleKayit] = useState<Davetli | null>(null)
  const [dark, setDark] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  // Dark mod tercihi localStorage'da saklanır
  useEffect(() => {
    const saved = localStorage.getItem('admin_dark')
    if (saved === '1') setDark(true)
  }, [])

  function toggleDark() {
    setDark(prev => {
      localStorage.setItem('admin_dark', prev ? '0' : '1')
      return !prev
    })
  }

  async function fetchDavetliler() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtre) params.set('filtre', filtre)
      if (arama) params.set('arama', arama)
      const res = await fetch(`/api/admin/davetliler?${params}`)
      if (res.status === 401) { router.push('/admin'); return }
      const data = await res.json()
      setDavetliler(data.davetliler)
      setToplam(data.toplam)
      setKatilimYapan(data.katilimYapan)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDavetliler() }, [filtre, arama])

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => { if (data && !data.error) setOverlayAyar({ ...VARSAYILAN_AYAR, ...data }) })
      .catch(() => {})
  }, [])

  const tumSecili = davetliler.length > 0 && secili.size === davetliler.length

  function toggleTum() {
    setSecili(tumSecili ? new Set() : new Set(davetliler.map(d => d.id)))
  }

  function toggleSecim(id: number) {
    setSecili(prev => {
      const yeni = new Set(prev)
      if (yeni.has(id)) yeni.delete(id); else yeni.add(id)
      return yeni
    })
  }

  async function tekSil(id: number) {
    setSiliniyor(true)
    try {
      const res = await fetch(`/api/admin/sil?id=${id}`, { method: 'DELETE' })
      if (res.ok) { setSecili(prev => { const y = new Set(prev); y.delete(id); return y }); await fetchDavetliler() }
    } catch (err) { console.error(err) }
    finally { setSiliniyor(false); setOnayModal(null) }
  }

  async function topluSil() {
    if (secili.size === 0) return
    setSiliniyor(true)
    try {
      const res = await fetch('/api/admin/sil', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(secili) }),
      })
      if (res.ok) { setSecili(new Set()); await fetchDavetliler() }
    } catch (err) { console.error(err) }
    finally { setSiliniyor(false); setOnayModal(null) }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true); setImportMesaj('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/import', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) { setImportMesaj(`✓ ${data.mesaj}`); fetchDavetliler() }
      else setImportMesaj(`✗ ${data.error}`)
    } catch { setImportMesaj('✗ Import hatası') }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = '' }
  }

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin')
  }

  function kopyalaLink(kod: string, id: number) {
    navigator.clipboard.writeText(`${baseUrl}/davetiye/${kod}`)
    setKopyalandi(id)
    setTimeout(() => setKopyalandi(null), 2000)
  }

  function whatsappGonder(telefon: string, kod: string, adSoyad: string) {
    // Türkiye numarası normalize et: 05xx → 905xx, +905xx → 905xx
    let numara = telefon.replace(/\s|-|\(|\)/g, '')
    if (numara.startsWith('+')) numara = numara.slice(1)
    if (numara.startsWith('0')) numara = '90' + numara.slice(1)
    if (!numara.startsWith('90')) numara = '90' + numara
    const link = `${baseUrl}/davetiye/${kod}`
    const mesaj = encodeURIComponent(`Sayın ${adSoyad}, kişisel dijital davetiyeniz hazır: ${link}`)
    window.open(`https://web.whatsapp.com/send?phone=${numara}&text=${mesaj}`, '_blank')
  }

  // Renk şemaları
  const d = dark
  const bg       = d ? '#0f172a' : '#f8fafc'
  const cardBg   = d ? '#1e293b' : '#ffffff'
  const cardBorder = d ? '#334155' : '#f1f5f9'
  const textPrimary = d ? '#f1f5f9' : '#1e293b'
  const textSecondary = d ? '#94a3b8' : '#64748b'
  const inputBg  = d ? '#0f172a' : '#ffffff'
  const inputBorder = d ? '#334155' : '#e2e8f0'
  const theadBg  = d ? '#1e293b' : '#f8fafc'
  const theadText = d ? '#94a3b8' : '#64748b'
  const rowHover = d ? '#1e293b' : '#f8fafc'
  const divider  = d ? '#1e293b' : '#f1f5f9'

  return (
    <main className="min-h-screen transition-colors duration-200" style={{ background: bg }}>
      {/* Header */}
      <div style={{ background: '#CC0000' }} className="text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-wide">Admin Paneli</h1>
            <p className="text-red-200 text-sm">Dijital Davetiye Sistemi</p>
          </div>
          <div className="flex gap-2 items-center">
            {/* Dark mod toggle */}
            <button onClick={toggleDark}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
              title={dark ? 'Açık mod' : 'Koyu mod'}>
              {dark ? '☀️' : '🌙'}
              <span className="hidden sm:inline">{dark ? 'Açık Mod' : 'Koyu Mod'}</span>
            </button>
            <button onClick={() => setAyarModalAcik(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition">
              ✏️ Yazı Ayarları
            </button>
            <button onClick={handleLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition">
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Toplam Davetli', value: toplam, color: textPrimary },
            { label: 'Katılım Bildirimi', value: katilimYapan, color: '#22c55e' },
            { label: 'Katılım Oranı', value: `${toplam > 0 ? Math.round((katilimYapan / toplam) * 100) : 0}%`, color: '#3b82f6' },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-5 shadow-sm border transition-colors"
              style={{ background: cardBg, borderColor: cardBorder }}>
              <p className="text-sm" style={{ color: textSecondary }}>{item.label}</p>
              <p className="text-3xl font-black mt-1" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Araçlar */}
        <div className="rounded-xl p-5 shadow-sm border transition-colors" style={{ background: cardBg, borderColor: cardBorder }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48">
              <input type="text" placeholder="Ad veya soyad ara..."
                value={arama} onChange={e => setArama(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 border transition-colors"
                style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
              />
            </div>
            <select value={filtre} onChange={e => setFiltre(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 border transition-colors"
              style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}>
              <option value="">Tümü</option>
              <option value="katildi">Katıldı</option>
              <option value="katilmadi">Katılmadı</option>
            </select>
            <button onClick={() => { setDuzenleKayit(null); setKayitModal(true) }}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: '#CC0000' }}>
              + Kayıt Oluştur
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={importing}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: '#6B21A8' }}>
              {importing ? 'Yükleniyor...' : 'CSV İçe Aktar'}
            </button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
            <button onClick={() => window.location.href = '/api/admin/export'}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: '#059669' }}>
              CSV Dışa Aktar
            </button>
          </div>
          {importMesaj && (
            <p className={`mt-3 text-sm font-medium ${importMesaj.startsWith('✓') ? 'text-green-500' : 'text-red-500'}`}>
              {importMesaj}
            </p>
          )}
        </div>

        {/* Toplu işlem çubuğu */}
        {secili.size > 0 && (
          <div className="rounded-xl px-5 py-3 flex items-center justify-between border"
            style={{ background: d ? '#3b0a0a' : '#fef2f2', borderColor: d ? '#7f1d1d' : '#fecaca' }}>
            <span className="font-medium text-sm" style={{ color: d ? '#fca5a5' : '#b91c1c' }}>
              {secili.size} kayıt seçildi
            </span>
            <div className="flex gap-2">
              <button onClick={() => setSecili(new Set())}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                style={{ background: cardBg, borderColor: cardBorder, color: textPrimary }}>
                Seçimi Kaldır
              </button>
              <button onClick={() => setOnayModal({ tip: 'toplu', sayi: secili.size })} disabled={siliniyor}
                className="px-4 py-1.5 rounded-lg text-sm text-white font-medium"
                style={{ background: '#DC2626' }}>
                {secili.size} Kaydı Sil
              </button>
            </div>
          </div>
        )}

        {/* Tablo */}
        <div className="rounded-xl shadow-sm border overflow-hidden transition-colors" style={{ background: cardBg, borderColor: cardBorder }}>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center" style={{ color: textSecondary }}>Yükleniyor...</div>
            ) : davetliler.length === 0 ? (
              <div className="p-8 text-center" style={{ color: textSecondary }}>Kayıt bulunamadı</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ background: theadBg, borderColor: cardBorder }}>
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={tumSecili} onChange={toggleTum}
                        className="w-4 h-4 rounded accent-red-600 cursor-pointer" />
                    </th>
                    {['Ad Soyad', 'İl / İlçe', 'Katılım', 'Kod', 'İşlemler'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: theadText }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {davetliler.map((d, i) => (
                    <tr key={d.id} className="transition-colors"
                      style={{
                        background: secili.has(d.id)
                          ? (dark ? '#3b0a0a' : '#fef2f2')
                          : undefined,
                        borderTop: i > 0 ? `1px solid ${divider}` : undefined,
                      }}
                      onMouseEnter={e => { if (!secili.has(d.id)) (e.currentTarget as HTMLElement).style.background = rowHover }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = secili.has(d.id) ? (dark ? '#3b0a0a' : '#fef2f2') : '' }}
                    >
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={secili.has(d.id)} onChange={() => toggleSecim(d.id)}
                          className="w-4 h-4 rounded accent-red-600 cursor-pointer" />
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: textPrimary }}>{d.ad} {d.soyad}</td>
                      <td className="px-4 py-3" style={{ color: textSecondary }}>
                        {d.il || '-'}{d.ilce ? ` / ${d.ilce}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: d.katilimVar ? (dark ? '#14532d' : '#dcfce7') : (dark ? '#422006' : '#fef3c7'),
                            color: d.katilimVar ? (dark ? '#86efac' : '#166534') : (dark ? '#fbbf24' : '#92400e'),
                          }}>
                          {d.katilimVar ? 'Katılacak' : 'Bekliyor'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: textSecondary }}>{d.kod}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => kopyalaLink(d.kod, d.id)}
                            className="px-3 py-1 rounded-lg text-xs font-medium transition"
                            style={{
                              background: kopyalandi === d.id ? (dark ? '#14532d' : '#dcfce7') : (dark ? '#334155' : '#f1f5f9'),
                              color: kopyalandi === d.id ? (dark ? '#86efac' : '#166534') : textPrimary,
                            }}>
                            {kopyalandi === d.id ? 'Kopyalandı!' : 'Link Kopyala'}
                          </button>
                          <button onClick={() => { setDuzenleKayit(d); setKayitModal(true) }}
                            className="px-3 py-1 rounded-lg text-xs font-medium border transition"
                            style={{
                              color: '#3b82f6',
                              borderColor: dark ? '#1d4ed8' : '#bfdbfe',
                              background: dark ? '#1e3a5f' : undefined,
                            }}>
                            Düzenle
                          </button>
                          {d.telefon && (
                            <button
                              onClick={() => whatsappGonder(d.telefon!, d.kod, `${d.ad} ${d.soyad}`)}
                              className="px-3 py-1 rounded-lg text-xs font-medium border transition"
                              title={`WhatsApp: ${d.telefon}`}
                              style={{
                                color: '#16a34a',
                                borderColor: dark ? '#14532d' : '#bbf7d0',
                                background: dark ? '#052e16' : undefined,
                              }}>
                              WhatsApp
                            </button>
                          )}
                          <button onClick={() => setOnayModal({ tip: 'tek', id: d.id })}
                            className="px-3 py-1 rounded-lg text-xs font-medium border transition"
                            style={{
                              color: '#ef4444',
                              borderColor: dark ? '#991b1b' : '#fecaca',
                              background: dark ? '#3b0a0a' : undefined,
                            }}>
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* CSV Format Bilgisi */}
        <div className="rounded-xl p-4 border transition-colors"
          style={{ background: d ? '#0c1a2e' : '#eff6ff', borderColor: d ? '#1e3a5f' : '#bfdbfe' }}>
          <p className="text-sm font-medium mb-1" style={{ color: d ? '#60a5fa' : '#1d4ed8' }}>CSV İçe Aktarma Formatı:</p>
          <code className="text-xs" style={{ color: d ? '#93c5fd' : '#1d4ed8' }}>
            ad,soyad,il,ilce,email,telefon<br />
            ÖMER,ŞİRANLI,İSTANBUL,KAĞITHANE,omer@example.com,05001234567
          </code>
        </div>
      </div>

      {/* Silme Onay Modalı */}
      {onayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl border"
            style={{ background: cardBg, borderColor: cardBorder }}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: d ? '#3b0a0a' : '#fef2f2' }}>
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: textPrimary }}>Silme Onayı</h3>
              <p className="text-sm mb-6" style={{ color: textSecondary }}>
                {onayModal.tip === 'tek'
                  ? 'Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
                  : `Seçili ${onayModal.sayi} kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setOnayModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                  style={{ borderColor: cardBorder, color: textPrimary, background: inputBg }}>
                  İptal
                </button>
                <button onClick={() => onayModal.tip === 'tek' ? tekSil(onayModal.id!) : topluSil()}
                  disabled={siliniyor}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#DC2626', opacity: siliniyor ? 0.7 : 1 }}>
                  {siliniyor ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <OverlayAyarModal
        open={ayarModalAcik}
        onClose={() => setAyarModalAcik(false)}
        onKaydet={(yeniAyar) => setOverlayAyar(yeniAyar)}
      />

      <KayitModal
        open={kayitModal}
        onClose={() => { setKayitModal(false); setDuzenleKayit(null) }}
        onKaydet={() => fetchDavetliler()}
        duzenle={duzenleKayit}
      />
    </main>
  )
}
