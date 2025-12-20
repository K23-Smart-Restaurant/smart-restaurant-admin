import "dotenv/config";
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

// Configure pool with SSL for production (Render requires SSL)
const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export default prisma
