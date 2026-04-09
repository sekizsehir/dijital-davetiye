import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateUniqueKod } from '@/lib/utils'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')

  if (!adminAuth || adminAuth.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV dosyası boş veya hatalı' }, { status: 400 })
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
    const adIdx = headers.indexOf('ad')
    const soyadIdx = headers.indexOf('soyad')
    const ilIdx = headers.indexOf('il')
    const ilceIdx = headers.indexOf('ilce')
    const emailIdx = headers.indexOf('email')
    const telefonIdx = headers.indexOf('telefon')

    if (adIdx === -1 || soyadIdx === -1) {
      return NextResponse.json({ error: 'CSV dosyasında "ad" ve "soyad" kolonları gerekli' }, { status: 400 })
    }

    let eklendi = 0
    const hatalar: string[] = []
    const duplikalar: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''))
      const ad = cols[adIdx]?.toUpperCase()
      const soyad = cols[soyadIdx]?.toUpperCase()

      if (!ad || !soyad) continue

      const existing = await prisma.davetli.findFirst({
        where: { ad, soyad },
      })

      if (existing) {
        duplikalar.push(`${ad} ${soyad}`)
        continue
      }

      try {
        const kod = await generateUniqueKod()
        await prisma.davetli.create({
          data: {
            kod,
            ad,
            soyad,
            il: ilIdx !== -1 ? cols[ilIdx]?.toUpperCase() || null : null,
            ilce: ilceIdx !== -1 ? cols[ilceIdx]?.toUpperCase() || null : null,
            email: emailIdx !== -1 ? cols[emailIdx] || null : null,
            telefon: telefonIdx !== -1 ? cols[telefonIdx] || null : null,
          },
        })
        eklendi++
      } catch (err) {
        hatalar.push(`Satır ${i + 1}: ${err}`)
      }
    }

    return NextResponse.json({
      success: true,
      eklendi,
      duplikalar,
      hatalar,
      mesaj: `${eklendi} kişi başarıyla eklendi.${duplikalar.length > 0 ? ` ${duplikalar.length} duplikat atlandı.` : ''}`,
    })
  } catch (error) {
    console.error('Import hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
