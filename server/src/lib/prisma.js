import "dotenv/config";
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('../../../../smart-restaurant-root/generated/prisma/index.js');

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export default prisma
