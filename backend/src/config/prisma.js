<<<<<<< HEAD
const { PrismaClient } = require('../../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
=======

const { PrismaClient } = require('../../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');

>>>>>>> 993a2c863a66ae192ca3ddedbecf3393fdac2910
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
<<<<<<< HEAD
const prisma = new PrismaClient({ adapter });


=======

const prisma = new PrismaClient({ adapter });

>>>>>>> 993a2c863a66ae192ca3ddedbecf3393fdac2910
module.exports = prisma;