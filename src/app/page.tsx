import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { portfolio } from "@/lib/service";
import { Workspace } from "@/components/workspace";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ institution?: string }>;
}) {
  const actor = await sessionUser((await cookies()).get("nexo_session")?.value);
  if (!actor) redirect("/login");
  if (actor.needsMfaSetup) redirect("/seguranca");
  const schools = await portfolio(actor);
  return (
    <Workspace
      initialInstitutionId={(await searchParams).institution}
      actor={actor}
      initialSchools={JSON.parse(JSON.stringify(schools))}
      demo={process.env.DEMO_MODE === "true"}
    />
  );
}
