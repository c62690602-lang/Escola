import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { mfaStatus } from "@/lib/mfa";
import { SecurityPanel } from "@/components/security-panel";
export const dynamic = "force-dynamic";
export default async function Page() {
  const actor = await sessionUser((await cookies()).get("nexo_session")?.value);
  if (!actor) redirect("/login");
  return (
    <SecurityPanel
      initial={JSON.parse(JSON.stringify(await mfaStatus(actor)))}
      name={actor.name}
    />
  );
}
