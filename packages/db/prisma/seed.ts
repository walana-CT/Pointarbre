import prisma from '../src'

async function main() {
  const triage1 = await prisma.triage.upsert({
    where: { id: 'Triage de schlipak' },
    update: {},
    create: {
      name: 'Triage de Lyon',
    },
  })

  console.log({ triage1 })
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })