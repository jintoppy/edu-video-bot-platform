import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Prevent multiple connections in development due to hot reloading
declare global {
  var postgresClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL!;

// Use a singleton pattern for the postgres client
const client = globalThis.postgresClient || postgres(connectionString, {
  max: 1, // Maximum number of connections
  idle_timeout: 20, // Max seconds a connection can be idle
  max_lifetime: 60 * 30 // Max seconds a connection can exist
});

// In development, save the client in the global object to prevent multiple connections
if (process.env.NODE_ENV === 'development') {
  globalThis.postgresClient = client;
}

export const db = drizzle(client, { schema });