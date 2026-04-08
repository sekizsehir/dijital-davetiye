'use client'

export interface OverlayAyar {
  overlay_top: string
  overlay_left: string
  overlay_color: string
  overlay_fontsize: string
  overlay_fontweight: string
  overlay_letterspacing: string
  overlay_textshadow: string
}

export const VARSAYILAN_AYAR: OverlayAyar = {
  overlay_top: '40',
  overlay_left: '50',
  overlay_color: '#ffffff',
  overlay_fontsize: '19',
  overlay_fontweight: '900',
  overlay_letterspacing: '0.05',
  overlay_textshadow: '1',
}

interface DavetiyeKartProps {
  ad: string
  soyad: string
  ayar?: OverlayAyar
}

export default function DavetiyeKart({ ad, soyad, ayar = VARSAYILAN_AYAR }: DavetiyeKartProps) {
  return (
    <div
      id="davetiye-kart"
      className="relative w-full max-w-md mx-auto shadow-2xl"
      style={{ borderRadius: '12px', overflow: 'hidden' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/davetiye-template.jpg"
        alt="Davetiye"
        className="w-full block"
        crossOrigin="anonymous"
      />

      {/* Ad Soyad Overlay */}
      <div
        className="absolute w-full text-center"
        style={{
          top: `${ayar.overlay_top}%`,
          left: 0,
          right: 0,
          padding: '0 24px',
        }}
      >
        <p
          className="uppercase leading-tight"
          style={{
            color: ayar.overlay_color,
            fontSize: `${ayar.overlay_fontsize}px`,
            fontWeight: Number(ayar.overlay_fontweight),
            letterSpacing: `${ayar.overlay_letterspacing}em`,
            textShadow: ayar.overlay_textshadow === '1'
              ? '0 2px 8px rgba(0,0,0,0.4)'
              : 'none',
          }}
        >
          {ad} {soyad}
        </p>
      </div>
    </div>
  )
}
