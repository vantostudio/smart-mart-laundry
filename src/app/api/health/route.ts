import { connection } from "next/server";

/* Uptime check. Runs per request, touches no database or env, so pings never wake Neon. */
export async function GET() {
  await connection();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
