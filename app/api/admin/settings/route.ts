import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

async function checkAuth() {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')
  return adminAuth?.value === process.env.ADMIN_PASSWORD
}

export async function GET() {
  const ayarlar = await prisma.ayar.findMany()
  const result: Record<string, string> = {}
  for (const a of ayarlar) {
    result[a.anahtar] = a.deger
  }
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const body = await request.json()

  for (const [anahtar, deger] of Object.entries(body)) {
    await prisma.ayar.upsert({
      where: { anahtar },
      update: { deger: String(deger) },
      create: { anahtar, deger: String(deger) },
    })
  }

  return NextResponse.json({ success: true })
}
