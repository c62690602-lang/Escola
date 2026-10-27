import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NEXO · Certtifica",
  description: "Inteligência que conecta. Gestão que transforma.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
