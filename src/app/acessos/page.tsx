import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { portfolio } from "@/lib/service";
import { AccessPanel } from "@/components/access-panel";
export const dynamic = "force-dynamic";
export default async function Page() {
  const actor = await sessionUser((await cookies()).get("nexo_session")?.value);
  if (!actor) redirect("/login");
  if (actor.needsMfaSetup) redirect("/seguranca");
  if (!actor.platformAdmin) redirect("/");
  const schools = await portfolio(actor);
  return (
    <AccessPanel schools={schools.map((s) => ({ id: s.id, name: s.name }))} />
  );
}
