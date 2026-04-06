import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    return token === process.env.ADMIN_PASSWORD
  }
  return false
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')

  if (!adminAuth || adminAuth.value !== process.env.ADMIN_PASSWORD) {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }
  }

  const { searchParams } = new URL(request.url)
  const filtre = searchParams.get('filtre')
  const arama = searchParams.get('arama') || ''

  const where: Record<string, unknown> = {}

  if (filtre === 'katildi') {
    where.katilimVar = true
  } else if (filtre === 'katilmadi') {
    where.katilimVar = false
  }

  if (arama) {
    where.OR = [
      { ad: { contains: arama } },
      { soyad: { contains: arama } },
    ]
  }

  const davetliler = await prisma.davetli.findMany({
    where,
    orderBy: { olusturmaTarihi: 'desc' },
  })

  const toplam = await prisma.davetli.count()
  const katilimYapan = await prisma.davetli.count({ where: { katilimVar: true } })

  return NextResponse.json({ davetliler, toplam, katilimYapan })
}
