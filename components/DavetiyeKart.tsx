'use client'

interface DavetiyeKartProps {
  ad: string
  soyad: string
}

export default function DavetiyeKart({ ad, soyad }: DavetiyeKartProps) {
  return (
    <div
      id="davetiye-kart"
      className="relative w-full max-w-md mx-auto shadow-2xl"
      style={{ borderRadius: '12px', overflow: 'hidden' }}
    >
      {/* Arka plan görseli */}
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
          top: '40%',
          left: 0,
          right: 0,
          padding: '0 24px',
        }}
      >
        <p
          className="text-white font-black uppercase tracking-wider leading-tight"
          style={{
            fontSize: 'clamp(13px, 3.5vw, 19px)',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            letterSpacing: '0.05em',
          }}
        >
          {ad} {soyad}
        </p>
      </div>
    </div>
  )
}
