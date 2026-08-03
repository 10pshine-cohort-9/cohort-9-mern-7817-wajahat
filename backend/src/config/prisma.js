const { PrismaClient } = require('../../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });


module.exports = prisma;