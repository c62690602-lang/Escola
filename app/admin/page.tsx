import Admin from "@/components/admin";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <Admin />;
}
