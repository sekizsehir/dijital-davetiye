import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateUniqueKod } from '@/lib/utils'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')
  return adminAuth?.value === process.env.ADMIN_PASSWORD
}

// Yeni kayıt oluştur
export async function POST(request: NextRequest) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  try {
    const { ad, soyad, il, ilce, email, telefon } = await request.json()

    if (!ad || !soyad) {
      return NextResponse.json({ error: 'Ad ve soyad zorunludur' }, { status: 400 })
    }

    const kod = await generateUniqueKod()
    const davetli = await prisma.davetli.create({
      data: {
        kod,
        ad: ad.toUpperCase(),
        soyad: soyad.toUpperCase(),
        il: il?.toUpperCase() || null,
        ilce: ilce?.toUpperCase() || null,
        email: email || null,
        telefon: telefon || null,
      },
    })

    return NextResponse.json({ success: true, davetli })
  } catch (error) {
    console.error('Kayıt oluşturma hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// Kayıt güncelle
export async function PUT(request: NextRequest) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  try {
    const { id, ad, soyad, il, ilce, email, telefon, katilimVar } = await request.json()

    if (!id || !ad || !soyad) {
      return NextResponse.json({ error: 'Id, ad ve soyad zorunludur' }, { status: 400 })
    }

    const davetli = await prisma.davetli.update({
      where: { id: Number(id) },
      data: {
        ad: ad.toUpperCase(),
        soyad: soyad.toUpperCase(),
        il: il?.toUpperCase() || null,
        ilce: ilce?.toUpperCase() || null,
        email: email || null,
        telefon: telefon || null,
        katilimVar: Boolean(katilimVar),
      },
    })

    return NextResponse.json({ success: true, davetli })
  } catch (error) {
    console.error('Güncelleme hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
