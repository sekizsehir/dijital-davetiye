'use client'

export interface OverlayAyar {
  overlay_top: string
  overlay_left: string
  overlay_color: string
  overlay_fontsize: string
  overlay_fontweight: string
  overlay_letterspacing: string
  overlay_textshadow: string
  overlay_font: string
}

export const VARSAYILAN_AYAR: OverlayAyar = {
  overlay_top: '40',
  overlay_left: '50',
  overlay_color: '#000000',
  overlay_fontsize: '19',
  overlay_fontweight: '700',
  overlay_letterspacing: '0.05',
  overlay_textshadow: '0',
  overlay_font: 'inherit',
}

interface DavetiyeKartProps {
  ad: string
  soyad: string
  ayar: OverlayAyar
}

export default function DavetiyeKart({ ad, soyad, ayar }: DavetiyeKartProps) {
  const top = parseFloat(ayar.overlay_top) || 40
  const fontSize = parseFloat(ayar.overlay_fontsize) || 19
  const fontWeight = parseInt(ayar.overlay_fontweight) || 700
  const letterSpacing = parseFloat(ayar.overlay_letterspacing) || 0.05
  const hasShadow = ayar.overlay_textshadow === '1'
  const color = ayar.overlay_color || '#000000'
  const fontFamily = ayar.overlay_font && ayar.overlay_font !== 'inherit'
    ? `"${ayar.overlay_font}", sans-serif`
    : 'inherit'

  return (
    <div
      id="davetiye-kart"
      style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/dijital-davetiye.jpg"
        alt="Davetiye"
        style={{ width: '100%', display: 'block' }}
        crossOrigin="anonymous"
      />

      {/* Ad Soyad Overlay */}
      <div
        style={{
          position: 'absolute',
          top: `${top}%`,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 20px',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            color,
            fontSize: `${fontSize}px`,
            fontWeight,
            letterSpacing: `${letterSpacing}em`,
            fontFamily,
            textTransform: 'uppercase',
            lineHeight: 1.2,
            textShadow: hasShadow ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          {ad} {soyad}
        </span>
      </div>
    </div>
  )
}
