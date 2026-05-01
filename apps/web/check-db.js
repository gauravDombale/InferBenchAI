import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log("Tables:", tables);

    // Insert dummy prompts
    await sql`
      INSERT INTO prompts (category, prompt, expected) VALUES
      ('reasoning', 'What is 2+2?', '4'),
      ('coding', 'Write a function that returns true', 'function() { return true; }'),
      ('summarization', 'Summarize this long text in one sentence: The cat sat on the mat.', 'A cat was on a mat.'),
      ('instruction_following', 'Output exactly "Hello World" and nothing else.', 'Hello World'),
      ('factual_qa', 'What is the capital of France?', 'Paris')
      ON CONFLICT DO NOTHING;
    `;
    console.log("Inserted prompts.");
    
    const prompts = await sql`SELECT * FROM prompts`;
    console.log("Prompts:", prompts);

  } catch (error) {
    console.error("Error:", error);
  }
}
run();
