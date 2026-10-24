import ContactPage from "@/components/contact-page";
export const metadata = {
  title: "Agendar apresentação",
  description:
    "Solicite uma apresentação do programa NEXO para sua instituição de ensino.",
  alternates: { canonical: "/agendar-apresentacao" },
};
export default function Page() {
  return <ContactPage schedule />;
}
