import { prisma } from './db'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateKod(length = 6): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }
  return result
}

export async function generateUniqueKod(): Promise<string> {
  let kod = generateKod()
  let existing = await prisma.davetli.findUnique({ where: { kod } })
  while (existing) {
    kod = generateKod()
    existing = await prisma.davetli.findUnique({ where: { kod } })
  }
  return kod
}
