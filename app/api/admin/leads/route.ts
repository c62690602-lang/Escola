import { NextRequest, NextResponse } from "next/server";
import { validSession, sameOrigin } from "@/lib/security";
import { query } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  if (!validSession(req.cookies.get("nexo_admin")?.value))
    return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  try {
    const page = Math.max(
      0,
      Math.min(10000, Number(req.nextUrl.searchParams.get("page")) || 0),
    );
    const rows = await query(
      "SELECT id,created_at,payload FROM leads ORDER BY created_at DESC LIMIT 50 OFFSET $1",
      [page * 50],
    );
    return NextResponse.json(
      {
        leads: rows.map((r) => ({
          id: r.id,
          createdAt: r.created_at,
          ...JSON.parse(String(r.payload)),
        })),
        page,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Falha ao consultar contatos." },
      { status: 503 },
    );
  }
}
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req) || !validSession(req.cookies.get("nexo_admin")?.value))
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id || !/^[\da-f-]{36}$/i.test(id))
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    await query("DELETE FROM leads WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível excluir." },
      { status: 503 },
    );
  }
}
