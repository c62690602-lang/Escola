import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { portfolio } from "@/lib/service";
import { Workspace } from "@/components/workspace";
export const dynamic = "force-dynamic";
export default async function Page() {
  const actor = await sessionUser((await cookies()).get("nexo_session")?.value);
  if (!actor) redirect("/login");
  const schools = await portfolio(actor);
  return (
    <Workspace
      actor={actor}
      initialSchools={JSON.parse(JSON.stringify(schools))}
      demo={process.env.DEMO_MODE === "true"}
    />
  );
}
