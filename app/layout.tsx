import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import Consent from "@/components/consent";
import Reveal from "@/components/reveal";
const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "NEXO · Inteligência que conecta. Gestão que transforma.",
    template: "%s | NEXO · Certtifica",
  },
  description:
    "Um programa contínuo que conecta gestão, saúde, segurança e prevenção nas instituições de ensino. Conheça o NEXO, uma solução Certtifica.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "NEXO · Certtifica",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "NEXO — Inteligência que conecta. Gestão que transforma.",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Navigation />
        <main id="conteudo">{children}</main>
        <Footer />
        <Consent />
        <Reveal />
      </body>
    </html>
  );
}
