import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  console.log("Setting up database schema...");

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS prompts (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        prompt TEXT NOT NULL,
        expected TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        model TEXT NOT NULL,
        prompt_id INTEGER REFERENCES prompts(id),
        latency_ms INTEGER NOT NULL,
        tokens_per_sec NUMERIC NOT NULL,
        response_text TEXT,
        score INTEGER,
        ram_usage_mb INTEGER,
        cpu_percent INTEGER,
        run_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auth_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        email TEXT UNIQUE,
        "emailVerified" TIMESTAMP,
        image TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auth_accounts (
        id SERIAL PRIMARY KEY,
        "userId" UUID REFERENCES auth_users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        type TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        access_token TEXT,
        expires_at INTEGER,
        refresh_token TEXT,
        id_token TEXT,
        scope TEXT,
        session_state TEXT,
        token_type TEXT,
        password TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id SERIAL PRIMARY KEY,
        "userId" UUID REFERENCES auth_users(id) ON DELETE CASCADE,
        expires TIMESTAMP NOT NULL,
        "sessionToken" TEXT UNIQUE NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auth_verification_token (
        identifier TEXT NOT NULL,
        expires TIMESTAMP NOT NULL,
        token TEXT NOT NULL,
        PRIMARY KEY (identifier, token)
      );
    `;

    console.log("Database schema created successfully!");
  } catch (error) {
    console.error("Error creating schema:", error);
  }
}

setup();
