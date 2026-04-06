import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kod, ad, soyad, il, ilce } = body

    if (!kod) {
      return NextResponse.json({ error: 'Kod gerekli' }, { status: 400 })
    }

    const davetli = await prisma.davetli.findUnique({
      where: { kod: kod.toUpperCase() },
    })

    if (!davetli) {
      return NextResponse.json({ error: 'Davetli bulunamadı' }, { status: 404 })
    }

    const updated = await prisma.davetli.update({
      where: { kod: kod.toUpperCase() },
      data: {
        ad: ad || davetli.ad,
        soyad: soyad || davetli.soyad,
        il: il || davetli.il,
        ilce: ilce || davetli.ilce,
        katilimVar: true,
        katilimTarihi: new Date(),
      },
    })

    return NextResponse.json({ success: true, davetli: updated })
  } catch (error) {
    console.error('Katılım hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
