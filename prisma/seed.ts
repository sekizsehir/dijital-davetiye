import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const testUsers = [
    { kod: 'JCIGWY', ad: 'ÖMER', soyad: 'ŞİRANLI', il: 'İSTANBUL', ilce: 'KAĞITHANE', email: 'omer@example.com' },
    { kod: 'ABCDEF', ad: 'AHMET', soyad: 'YILMAZ', il: 'ANKARA', ilce: 'ÇANKAYA', email: 'ahmet@example.com' },
  ]

  for (const user of testUsers) {
    await prisma.davetli.upsert({
      where: { kod: user.kod },
      update: {},
      create: user,
    })
  }

  console.log('Seed tamamlandı')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
