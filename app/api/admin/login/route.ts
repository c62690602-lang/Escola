import { NextRequest, NextResponse } from "next/server";
import {
  adminConfigured,
  constantEqual,
  createSession,
  sameOrigin,
  clientKey,
} from "@/lib/security";
import { rateLimit } from "@/lib/db";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Origem não autorizada." },
      { status: 403 },
    );
  if (!adminConfigured())
    return NextResponse.json(
      {
        error:
          "Administração não configurada. Defina ADMIN_PASSWORD com pelo menos 16 caracteres no servidor.",
      },
      { status: 503 },
    );
  try {
    if (!(await rateLimit(`login:${clientKey(req)}`, 10, 900000)))
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 15 minutos." },
        { status: 429 },
      );
    const text = await req.text();
    if (text.length > 2048)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    const data = JSON.parse(text);
    if (
      typeof data.password !== "string" ||
      !constantEqual(data.password, process.env.ADMIN_PASSWORD!)
    )
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 },
      );
    const res = NextResponse.json({ ok: true });
    res.cookies.set("nexo_admin", createSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 28800,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    return NextResponse.json(
      { error: "Administração indisponível." },
      { status: 503 },
    );
  }
}
