import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')
  return adminAuth?.value === process.env.ADMIN_PASSWORD
}

// Tek kayıt sil: DELETE /api/admin/sil?id=1
// Toplu sil:    DELETE /api/admin/sil  body: { ids: [1,2,3] }
export async function DELETE(request: NextRequest) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const tekId = searchParams.get('id')

    if (tekId) {
      await prisma.davetli.delete({ where: { id: Number(tekId) } })
      return NextResponse.json({ success: true, silinen: 1 })
    }

    const body = await request.json()
    const ids: number[] = body.ids

    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: 'Silinecek kayıt belirtilmedi' }, { status: 400 })
    }

    const { count } = await prisma.davetli.deleteMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({ success: true, silinen: count })
  } catch (error) {
    console.error('Silme hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
