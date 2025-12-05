//packages/db/prisma/seed.ts
import prisma from '../src'

async function main() {


  //seeding de triages
  const triage1 = await prisma.triage.upsert({
    where: { name: 'Triage1' },
    update: {},
    create: {
      name: 'Triage1',
    },
  })

  const foret_bilsteinstal = await prisma.foret.upsert({
    where: { name: 'foret_bilsteinstal' },
    update: {},
    create: {
      name: 'foret_bilsteinstal',
      triage: {
        connect: { id: triage1.id } // <- ici on référence le triage existant
      }
    },
  })

   const foret_ursprung = await prisma.foret.upsert({
    where: { name: 'foret_ursprung' },
    update: {},
    create: {
      name: 'foret_ursprung',
      triage: {
        connect: { id: triage1.id } // <- ici on référence le triage existant
      }
    },
  }) 

  const parcelle1 = await prisma.parcelle.upsert({
    where: { id: 'some-id' },
    update: {},
    create: {
      name: 'parcelle1',
      foret: {
        connect: { id: foret_bilsteinstal.id }
      }
    },
  })


  const parcelle2 = await prisma.parcelle.upsert({
    where: { id: 'some-id' },
    update: {},
    create: {
      name: 'parcelle2',
      foret: {
        connect: { id: foret_bilsteinstal.id }
      }
    },
  })

  const parcelle3 = await prisma.parcelle.upsert({
    where: { id: 'some-id' },
    update: {},
    create: {
      name: 'parcelle3',
      foret: {
        connect: { id: foret_ursprung.id }
      }
    },
  })

  const parcelle4 = await prisma.parcelle.upsert({
    where: { id: 'some-id' },
    update: {},
    create: {
      name: 'parcelle3',
      foret: {
        connect: { id: foret_ursprung.id }
      }
    },
  })


  console.log({ triage1, foret_ursprung, foret_bilsteinstal})
  console.log({ triage1, foret_ursprung, foret_bilsteinstal})


}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })