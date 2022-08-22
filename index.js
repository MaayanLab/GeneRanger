// import { PrismaClient } from '@prisma/client'
const PrismaClient = require('@prisma/client');

const prisma = PrismaClient()

async function main() {
    const allUsers = await prisma.students.findMany()
    console.log(allUsers)
  }

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })