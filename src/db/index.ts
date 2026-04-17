import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Menggunakan connection string dari environment variables
const connectionString = process.env.DATABASE_URL!;

// Disable prefetch karena ini akan berjalan di Serverless environment (Vercel)
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });