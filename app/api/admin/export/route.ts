import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')

  if (!adminAuth || adminAuth.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const davetliler = await prisma.davetli.findMany({
    orderBy: { olusturmaTarihi: 'desc' },
    select: {
      ad: true,
      soyad: true,
      il: true,
      ilce: true,
      email: true,
      telefon: true,
      katilimVar: true,
      kod: true,
      olusturmaTarihi: true,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const headers = ['Ad', 'Soyad', 'İl', 'İlçe', 'Email', 'Telefon', 'Katılım', 'Davetiye Linki', 'Oluşturma Tarihi']
  const rows = davetliler.map(d => [
    d.ad,
    d.soyad,
    d.il ?? '',
    d.ilce ?? '',
    d.email ?? '',
    d.telefon ?? '',
    d.katilimVar ? 'Evet' : 'Hayır',
    `${baseUrl}/davetiye/${d.kod}`,
    new Date(d.olusturmaTarihi).toLocaleDateString('tr-TR'),
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  return new NextResponse('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="davetliler.csv"',
    },
  })
}
