import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const results = await sql`
      SELECT r.*, p.category, p.prompt 
      FROM results r 
      JOIN prompts p ON r.prompt_id = p.id 
      ORDER BY r.created_at DESC
    `;
    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
