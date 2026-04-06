import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kod: string }> }
) {
  const { kod } = await params
  const davetli = await prisma.davetli.findUnique({
    where: { kod: kod.toUpperCase() },
  })

  if (!davetli) {
    return NextResponse.json({ error: 'Davetli bulunamadı' }, { status: 404 })
  }

  return NextResponse.json(davetli)
}
