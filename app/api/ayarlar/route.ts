import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const VARSAYILAN: Record<string, string> = {
  overlay_top: '40',
  overlay_left: '50',
  overlay_color: '#ffffff',
  overlay_fontsize: '19',
  overlay_fontweight: '900',
  overlay_letterspacing: '0.05',
  overlay_textshadow: '1',
}

export async function GET() {
  const result = { ...VARSAYILAN }
  try {
    const ayarlar = await prisma.ayar.findMany()
    for (const a of ayarlar) {
      result[a.anahtar] = a.deger
    }
  } catch {
    // Tablo henüz yoksa varsayılanları döndür
  }
  return NextResponse.json(result)
}
