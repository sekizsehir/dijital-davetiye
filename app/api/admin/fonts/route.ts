import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts')
    if (!fs.existsSync(fontsDir)) {
      return NextResponse.json({ fonts: [] })
    }
    const files = fs.readdirSync(fontsDir)
      .filter(f => /\.(ttf|woff|woff2|otf)$/i.test(f))
      .map(f => ({
        dosya: f,
        ad: f.replace(/\.(ttf|woff|woff2|otf)$/i, ''),
      }))
    return NextResponse.json({ fonts: files })
  } catch {
    return NextResponse.json({ fonts: [] })
  }
}
