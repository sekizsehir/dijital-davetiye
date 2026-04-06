import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import DavetiyeSayfasi from './DavetiyeSayfasi'

interface Props {
  params: Promise<{ kod: string }>
}

export async function generateMetadata({ params }: Props) {
  const { kod } = await params
  const davetli = await prisma.davetli.findUnique({
    where: { kod: kod.toUpperCase() },
  })

  if (!davetli) {
    return { title: 'Davetiye Bulunamadı' }
  }

  return {
    title: `${davetli.ad} ${davetli.soyad} - Türkiye Divanı Daveti`,
    description: 'Saadet Partisi Türkiye Divanı etkinliğine davetlisiniz.',
  }
}

export default async function DavetiyePage({ params }: Props) {
  const { kod } = await params
  const davetli = await prisma.davetli.findUnique({
    where: { kod: kod.toUpperCase() },
  })

  if (!davetli) {
    notFound()
  }

  return (
    <DavetiyeSayfasi
      kod={davetli.kod}
      ad={davetli.ad}
      soyad={davetli.soyad}
      katilimVar={davetli.katilimVar}
    />
  )
}
