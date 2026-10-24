import Link from "next/link";
import LeadForm from "./lead-form";
import { Check, LockKeyhole, ArrowUpRight } from "./icons";
export default function ContactPage({
  schedule = false,
}: {
  schedule?: boolean;
}) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Início</Link>
            <span>/</span>
            <span>{schedule ? "Agendar apresentação" : "Contato"}</span>
          </div>
          <span className="eyebrow">VAMOS CONECTAR?</span>
          <h1>
            {schedule
              ? "O futuro do cuidado começa com uma conversa."
              : "Uma conexão que pode transformar a rotina."}
          </h1>
          <p>
            Conte um pouco sobre a sua instituição. Vamos entender suas
            prioridades e apresentar as possibilidades do programa NEXO.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container contact-layout">
          <aside className="contact-aside">
            <span className="eyebrow">PROPOSTA PERSONALIZADA</span>
            <h2>
              Cada escola tem
              <br />
              seu próprio contexto.
            </h2>
            <p>
              Um programa anual de implantação e acompanhamento recorrente, com
              escopo alinhado às necessidades da sua instituição.
            </p>
            <ul className="check-list">
              <li>
                <Check /> Conheça as frentes de cuidado e a plataforma.
              </li>
              <li>
                <Check /> Entenda a implantação dos primeiros 60 dias.
              </li>
              <li>
                <Check /> Explore o acompanhamento técnico mensal.
              </li>
            </ul>
            <div className="info-note">
              <LockKeyhole size={20} />
              <p>
                Seus dados serão usados para responder à sua solicitação. Não há
                agendamento automático nem envio de dados a um CRM nesta versão.
              </p>
            </div>
            {whatsapp && /^\d{10,15}$/.test(whatsapp) && (
              <a
                className="text-link"
                style={{ marginTop: 25 }}
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Conversar pelo WhatsApp <ArrowUpRight size={16} />
              </a>
            )}
          </aside>
          <LeadForm schedule={schedule} />
        </div>
      </section>
    </>
  );
}
