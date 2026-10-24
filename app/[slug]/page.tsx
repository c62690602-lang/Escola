import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pages, moduleLinks } from "@/lib/content";
import Dashboard from "@/components/dashboard";
import CTA from "@/components/cta";
import { ArrowUpRight, Check, ShieldCheck } from "@/components/icons";
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = pages[slug];
  return p
    ? {
        title: p.title,
        description: p.intro,
        alternates: { canonical: `/${slug}` },
        openGraph: { title: p.title, description: p.intro, url: `/${slug}` },
      }
    : {};
}
export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = pages[slug];
  if (!p) notFound();
  const legal = ["privacidade", "termos"].includes(slug);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Início</Link>
            <span>/</span>
            <span>{p.eyebrow.split(" · ")[0]}</span>
          </div>
          <span className="eyebrow">{p.eyebrow}</span>
          <h1>{p.title}</h1>
          <p>{p.intro}</p>
        </div>
      </section>
      <section
        className={`section content-section ${legal ? "legal-content" : ""}`}
      >
        <div className="container">
          {slug === "central-de-inteligencia" && (
            <div className="full-dashboard-wrap">
              <Dashboard full />
            </div>
          )}
          {slug === "acreditacao" && (
            <div className="seal-group large-seals">
              {["Essencial", "Avançado", "Excelência"].map((s, i) => (
                <div className={`seal seal-${i}`} key={s}>
                  <ShieldCheck size={35} />
                  <span>NEXO</span>
                  <strong>{s}</strong>
                  <small>EXEMPLO VISUAL · 0{i + 1}</small>
                </div>
              ))}
            </div>
          )}
          <div className="content-grid">
            {p.sections.map((s, i) => (
              <article className="content-card" key={s.title}>
                <span className="card-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2>{s.title}</h2>
                {s.text && <p>{s.text}</p>}
                {s.items && (
                  <ul className="check-list">
                    {s.items.map((t) => (
                      <li key={t}>
                        <Check size={16} />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
          {p.note && (
            <aside className="info-note">
              <strong>Com transparência</strong>
              <p>{p.note}</p>
            </aside>
          )}
          {["modulos", "solucao"].includes(slug) && (
            <div className="related-links">
              {moduleLinks.map((m) => (
                <Link key={m.href} href={m.href}>
                  {m.title}
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
          )}
          {slug === "sobre" && (
            <aside className="info-note">
              <strong>Estrutura prevista · confirmação pública pendente</strong>
              <p>
                Fundadora e Direção de Promoção da Saúde: Camila Aguiar de
                Santana. Direção de Saúde Emocional: Katriane de Aguiar.
                Tecnologia: Cauan Moura Fraga Aguiar de Santana. Nomes e funções
                fornecidos no briefing, sujeitos à confirmação e autorização.
                Nenhuma credencial profissional é presumida.
              </p>
            </aside>
          )}
        </div>
      </section>
      {!legal && <CTA />}
    </>
  );
}
