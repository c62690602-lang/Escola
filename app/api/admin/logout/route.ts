import { NextRequest, NextResponse } from "next/server";
import { sameOrigin } from "@/lib/security";
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("nexo_admin");
  return res;
}
