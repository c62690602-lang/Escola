import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { validateLead } from "@/lib/validation";
import { query, rateLimit } from "@/lib/db";
import { sameOrigin, clientKey } from "@/lib/security";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Origem não autorizada." },
      { status: 403 },
    );
  if (!req.headers.get("content-type")?.includes("application/json"))
    return NextResponse.json({ error: "Formato inválido." }, { status: 415 });
  try {
    const text = await req.text();
    if (Buffer.byteLength(text) > 16000)
      return NextResponse.json(
        { error: "Solicitação muito grande." },
        { status: 413 },
      );
    let raw;
    try {
      raw = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    if (raw?.website)
      return NextResponse.json(
        { error: "Não foi possível enviar esta solicitação." },
        { status: 400 },
      );
    const result = validateLead(raw);
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    const elapsed = Date.now() - Number(raw.startedAt);
    if (!Number.isFinite(elapsed) || elapsed < 2500 || elapsed > 86400000)
      return NextResponse.json(
        {
          error:
            "Aguarde alguns segundos ou atualize a página antes de enviar.",
        },
        { status: 400 },
      );
    if (!(await rateLimit(`leads:${clientKey(req)}`, 5, 600000)))
      return NextResponse.json(
        { error: "Muitas solicitações. Tente novamente em 10 minutos." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    const id = randomUUID();
    await query("INSERT INTO leads (id,created_at,payload) VALUES ($1,$2,$3)", [
      id,
      new Date().toISOString(),
      JSON.stringify({
        ...result.data,
        privacyVersion: "1",
        source: raw.source === "agendamento" ? "agendamento" : "contato",
      }),
    ]);
    return NextResponse.json(
      { ok: true, reference: id },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    console.error(
      "Lead submission failed: database unavailable or invalid configuration",
    );
    return NextResponse.json(
      {
        error:
          "Não foi possível registrar seu contato agora. Tente novamente mais tarde.",
      },
      { status: 503 },
    );
  }
}
