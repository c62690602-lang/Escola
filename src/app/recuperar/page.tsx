import { AccountFlow } from "@/components/account-flow";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <AccountFlow
      recoveryAvailable={
        process.env.DEMO_MODE === "true" && process.env.PUBLIC_DEMO !== "true"
      }
    />
  );
}
