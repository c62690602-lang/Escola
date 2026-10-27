import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { login, sessionUser, digest } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessions } from "@/lib/schema";
import * as svc from "@/lib/service";
import * as access from "@/lib/access";
import * as mfa from "@/lib/mfa";
import {
  MfaRequiredError,
  MfaInvalidError,
  MfaConfigurationError,
} from "@/lib/mfa-crypto";
export const runtime = "nodejs";
async function readJson(req: NextRequest) {
  if (!req.headers.get("content-type")?.includes("application/json"))
    throw new SyntaxError("JSON required");
  const reader = req.body?.getReader();
  if (!reader) throw new SyntaxError("Empty body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16384) {
      await reader.cancel();
      throw new RangeError("Body too large");
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
async function handle(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await context.params;
    const route = path.join("/");
    const method = req.method;
    if (
      method !== "GET" &&
      req.headers.get("origin") !==
        (process.env.APP_ORIGIN ??
          process.env.RENDER_EXTERNAL_URL ??
          `${req.nextUrl.protocol}//${req.headers.get("host")}`)
    )
      return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
    if (Number(req.headers.get("content-length") ?? 0) > 16384)
      return NextResponse.json(
        { error: "Requisição muito grande" },
        { status: 413 },
      );
    const jar = await cookies();
    if (route === "auth/login" && method === "POST") {
      const body = z
        .object({
          email: z.email().max(254),
          password: z.string().min(1).max(256),
          code: z.string().max(40).optional(),
        })
        .parse(await readJson(req));
      const token = await login(
        body.email,
        body.password,
        body.code || undefined,
      );
      if (!token)
        return NextResponse.json(
          { error: "E-mail ou senha inválidos" },
          { status: 401 },
        );
      jar.set("nexo_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 28800,
      });
      const authenticated = await sessionUser(token);
      return NextResponse.json({
        ok: true,
        needsMfaSetup: authenticated?.needsMfaSetup ?? false,
      });
    }
    const actor = await sessionUser(jar.get("nexo_session")?.value);
    if (
      actor?.needsMfaSetup &&
      ![
        "auth/security",
        "auth/mfa/setup",
        "auth/mfa/confirm",
        "auth/logout",
      ].includes(route)
    )
      return NextResponse.json(
        {
          error: "Conclua o cadastro de MFA antes de acessar a operação",
          code: "MFA_SETUP_REQUIRED",
        },
        { status: 403 },
      );
    if (route === "auth/invitations/accept" && method === "POST") {
      await access.acceptInvitation(await readJson(req), actor);
      return NextResponse.json({ ok: true });
    }
    if (route === "auth/recovery" && method === "POST") {
      await access.requestRecovery(await readJson(req));
      return NextResponse.json({
        ok: true,
        message:
          "Se houver uma conta, as instruções estarão na caixa de saída local da demonstração.",
      });
    }
    if (route === "auth/reset" && method === "POST") {
      await access.resetPassword(await readJson(req));
      jar.delete("nexo_session");
      return NextResponse.json({ ok: true });
    }
    if (!actor)
      return NextResponse.json(
        { error: "Autenticação necessária" },
        { status: 401 },
      );
    if (route === "auth/logout" && method === "POST") {
      const token = jar.get("nexo_session")?.value;
      if (token)
        await db.delete(sessions).where(eq(sessions.tokenHash, digest(token)));
      jar.delete("nexo_session");
      return NextResponse.json({ ok: true });
    }
    if (route === "central" && method === "GET")
      return NextResponse.json(await svc.commandCenter(actor));
    if (route === "auth/security" && method === "GET")
      return NextResponse.json(await mfa.mfaStatus(actor));
    if (route === "auth/mfa/setup" && method === "POST")
      return NextResponse.json(
        await mfa.beginMfaSetup(actor, await readJson(req)),
      );
    if (route === "auth/mfa/confirm" && method === "POST")
      return NextResponse.json(
        await mfa.confirmMfaSetup(
          actor,
          jar.get("nexo_session")!.value,
          await readJson(req),
        ),
      );
    if (actor.needsMfaSetup)
      return NextResponse.json(
        {
          error: "Conclua o cadastro de MFA antes de acessar a operação",
          code: "MFA_SETUP_REQUIRED",
        },
        { status: 403 },
      );
    if (route === "auth/mfa/disable" && method === "POST") {
      await mfa.disableMfa(actor, await readJson(req));
      jar.delete("nexo_session");
      return NextResponse.json({ ok: true });
    }
    if (route === "institutions" && method === "GET")
      return NextResponse.json(await svc.portfolio(actor));
    if (route === "institutions" && method === "POST")
      return NextResponse.json(
        { id: await svc.createInstitution(actor, await readJson(req)) },
        { status: 201 },
      );
    const [, id, resource, entityId] = path;
    if (path[0] === "institutions" && id) {
      if (resource === "access" && method === "GET")
        return NextResponse.json(await access.listAccess(actor, id));
      if (resource === "invitations" && method === "POST")
        return NextResponse.json(
          await access.invite(actor, id, await readJson(req)),
          { status: 201 },
        );
      if (resource === "invitations" && entityId && method === "PATCH") {
        await access.revokeInvitation(actor, id, entityId);
        return NextResponse.json({ ok: true });
      }
      if (resource === "members" && entityId && method === "PATCH") {
        await access.changeMembership(actor, id, entityId, await readJson(req));
        return NextResponse.json({ ok: true });
      }
      if (!resource && method === "GET")
        return NextResponse.json(await svc.overview(actor, id));
      if (resource === "care") {
        await svc.confidentialAccess();
      }
      if (resource === "tasks" && method === "POST") {
        return NextResponse.json(
          { id: await svc.createTask(actor, id, await readJson(req)) },
          { status: 201 },
        );
      }
      if (resource === "tasks" && entityId && method === "PATCH") {
        await svc.updateTask(actor, id, entityId, await readJson(req));
        return NextResponse.json({ ok: true });
      }
      if (resource === "onboarding" && method === "POST") {
        await svc.startOnboarding(actor, id, await readJson(req));
        return NextResponse.json({ ok: true }, { status: 201 });
      }
      if (resource === "units" && method === "POST") {
        await svc.createUnit(actor, id, await readJson(req));
        return NextResponse.json({ ok: true }, { status: 201 });
      }
      if (resource === "report" && method === "GET") {
        await svc.authorize(actor, id, "reports.read");
        const data = await svc.overview(actor, id);
        return NextResponse.json({
          version: 1,
          generatedAt: new Date().toISOString(),
          responsible: actor.name,
          notice:
            "Relatório operacional. Revisão humana necessária antes do compartilhamento.",
          ...data,
        });
      }
    }
    return NextResponse.json({ error: "Rota não encontrada" }, { status: 404 });
  } catch (error) {
    if (error instanceof MfaRequiredError)
      return NextResponse.json(
        { error: error.message, mfaRequired: true },
        { status: 401 },
      );
    if (error instanceof MfaInvalidError)
      return NextResponse.json(
        { error: error.message, mfaRequired: true },
        { status: 401 },
      );
    if (error instanceof MfaConfigurationError)
      return NextResponse.json({ error: error.message }, { status: 503 });
    if (error instanceof SyntaxError)
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    if (error instanceof RangeError)
      return NextResponse.json(
        { error: "Requisição muito grande" },
        { status: 413 },
      );
    if (error instanceof access.DeliveryUnavailable)
      return NextResponse.json({ error: error.message }, { status: 503 });
    if (error instanceof svc.AccessError)
      return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof z.ZodError)
      return NextResponse.json(
        {
          error: "Dados inválidos",
          fields: error.issues.map((i) => i.path.join(".")),
        },
        { status: 400 },
      );
    if (error instanceof Error && error.message === "RATE_LIMIT")
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 15 minutos." },
        { status: 429 },
      );
    if (error instanceof svc.ConflictError)
      return NextResponse.json({ error: error.message }, { status: 409 });
    console.error("API operation failed");
    return NextResponse.json(
      { error: "Não foi possível concluir a operação" },
      { status: 500 },
    );
  }
}
export { handle as GET, handle as POST, handle as PATCH };
