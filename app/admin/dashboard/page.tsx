'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import OverlayAyarModal from '@/components/OverlayAyarModal'
import { OverlayAyar, VARSAYILAN_AYAR } from '@/components/DavetiyeKart'

interface Davetli {
  id: number
  kod: string
  ad: string
  soyad: string
  il: string | null
  ilce: string | null
  email: string | null
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
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  async function fetchDavetliler() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtre) params.set('filtre', filtre)
      if (arama) params.set('arama', arama)

      const res = await fetch(`/api/admin/davetliler?${params}`)
      if (res.status === 401) {
        router.push('/admin')
        return
      }
      const data = await res.json()
      setDavetliler(data.davetliler)
      setToplam(data.toplam)
      setKatilimYapan(data.katilimYapan)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDavetliler()
  }, [filtre, arama])

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) setOverlayAyar({ ...VARSAYILAN_AYAR, ...data })
      })
      .catch(() => {})
  }, [])

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportMesaj('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setImportMesaj(`✓ ${data.mesaj}`)
        fetchDavetliler()
      } else {
        setImportMesaj(`✗ ${data.error}`)
      }
    } catch {
      setImportMesaj('✗ Import hatası')
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleExport() {
    window.location.href = '/api/admin/export'
  }

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin')
  }

  function kopyalaLink(kod: string, id: number) {
    const link = `${baseUrl}/davetiye/${kod}`
    navigator.clipboard.writeText(link)
    setKopyalandi(id)
    setTimeout(() => setKopyalandi(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ background: '#CC0000' }} className="text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-wide">Admin Paneli</h1>
            <p className="text-red-200 text-sm">Türkiye Divanı Davetiye Sistemi</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAyarModalAcik(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              ✏️ Yazı Ayarları
            </button>
            <button
              onClick={handleLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Toplam Davetli</p>
            <p className="text-3xl font-black text-gray-800 mt-1">{toplam}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Katılım Bildirimi</p>
            <p className="text-3xl font-black text-green-600 mt-1">{katilimYapan}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Katılım Oranı</p>
            <p className="text-3xl font-black text-blue-600 mt-1">
              {toplam > 0 ? Math.round((katilimYapan / toplam) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Araçlar */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48">
              <input
                type="text"
                placeholder="Ad veya soyad ara..."
                value={arama}
                onChange={e => setArama(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <select
              value={filtre}
              onChange={e => setFiltre(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="">Tümü</option>
              <option value="katildi">Katıldı</option>
              <option value="katilmadi">Katılmadı</option>
            </select>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium transition"
              style={{ background: '#6B21A8' }}
            >
              {importing ? 'Yükleniyor...' : 'CSV İçe Aktar'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImport}
            />

            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium transition"
              style={{ background: '#059669' }}
            >
              CSV Dışa Aktar
            </button>
          </div>

          {importMesaj && (
            <p className={`mt-3 text-sm font-medium ${importMesaj.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
              {importMesaj}
            </p>
          )}
        </div>

        {/* Tablo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
            ) : davetliler.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Kayıt bulunamadı</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Ad Soyad</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">İl / İlçe</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Katılım</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Kod</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {davetliler.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {d.ad} {d.soyad}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {d.il || '-'} {d.ilce ? `/ ${d.ilce}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: d.katilimVar ? '#dcfce7' : '#fef3c7',
                            color: d.katilimVar ? '#166534' : '#92400e',
                          }}
                        >
                          {d.katilimVar ? 'Katılacak' : 'Bekliyor'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-500 text-xs">{d.kod}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => kopyalaLink(d.kod, d.id)}
                          className="px-3 py-1 rounded-lg text-xs font-medium transition"
                          style={{
                            background: kopyalandi === d.id ? '#dcfce7' : '#f3f4f6',
                            color: kopyalandi === d.id ? '#166534' : '#374151',
                          }}
                        >
                          {kopyalandi === d.id ? 'Kopyalandı!' : 'Link Kopyala'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* CSV Format Bilgisi */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-blue-800 text-sm font-medium mb-1">CSV İçe Aktarma Formatı:</p>
          <code className="text-blue-700 text-xs">
            ad,soyad,il,ilce,email<br />
            ÖMER,ŞİRANLI,İSTANBUL,KAĞITHANE,omer@example.com
          </code>
        </div>
      </div>

      <OverlayAyarModal
        open={ayarModalAcik}
        onClose={() => setAyarModalAcik(false)}
        mevcutAyar={overlayAyar}
        onKaydet={(yeniAyar) => setOverlayAyar(yeniAyar)}
      />
    </main>
  )
}
