import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const prompts = await sql`SELECT * FROM prompts ORDER BY id ASC`;
    return Response.json(prompts);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
