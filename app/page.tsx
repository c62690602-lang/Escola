import Link from "next/link";
import Dashboard from "@/components/dashboard";
import CTA from "@/components/cta";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  HeartPulse,
  ShieldCheck,
  Sprout,
  Network,
  Sparkles,
  Layers,
} from "@/components/icons";
import {
  HeroNetwork,
  SolutionExplorer,
  ProgramJourney,
  EverydayScenarios,
  HomeFAQ,
} from "@/components/home-experience";
export const metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return (
    <div className="modern-home">
      <section className="modern-hero">
        <div className="hero-ambient" aria-hidden="true" />
        <div className="container modern-hero-grid">
          <div className="modern-hero-copy">
            <span className="eyebrow">
              <span className="live-dot" /> CERTTIFICA APRESENTA
            </span>
            <div className="hero-product">
              nexo<span>✳</span>
            </div>
            <p className="modern-signature">
              Inteligência que conecta. Gestão que transforma.
            </p>
            <h1>
              Mais clareza
              <br />
              para gerir.
              <br />
              <span>
                Mais cuidado
                <br className="hero-mobile-br" /> para conectar.
              </span>
            </h1>
            <p className="modern-hero-description">
              Saúde, segurança e pessoas no mesmo lugar. <br />
              Uma plataforma para organizar. Uma equipe para acompanhar a sua
              escola.
            </p>
            <div className="modern-hero-actions">
              <Link href="/agendar-apresentacao" className="button">
                Quero conhecer o NEXO <ArrowUpRight size={19} />
              </Link>
              <a href="#como-ajuda" className="hero-explore">
                Explore a solução <ArrowRight size={17} />
              </a>
            </div>
            <div className="modern-hero-proof">
              <span>
                <Check size={14} /> Programa anual
              </span>
              <span>
                <Check size={14} /> Acompanhamento mensal
              </span>
            </div>
          </div>
          <div className="modern-hero-visual">
            <HeroNetwork />
            <div className="hero-visual-caption">
              <span>PLATAFORMA + PESSOAS + ACOMPANHAMENTO</span>
              <span>Representação conceitual</span>
            </div>
          </div>
        </div>
        <div className="container hero-bottom-note">
          <span>DA ROTINA DA ESCOLA À PRÓXIMA DECISÃO.</span>
          <a href="#entenda">
            Conheça um jeito mais conectado de cuidar <ArrowRight size={16} />
          </a>
        </div>
      </section>
      <section className="simple-intro section" id="entenda">
        <div className="container">
          <span className="eyebrow">O NEXO, EM POUCAS PALAVRAS</span>
          <div className="intro-heading">
            <h2>
              Cuidar de uma escola
              <br />
              tem muitas partes.
              <br />
              <span>A gente ajuda a conectar.</span>
            </h2>
            <p>
              O NEXO reúne tecnologia e acompanhamento técnico para organizar a
              prevenção, apoiar as equipes e dar mais contexto às decisões da
              direção.
            </p>
          </div>
          <div className="value-grid">
            {[
              {
                icon: Layers,
                n: "01",
                title: "Tudo mais organizado",
                text: "Planos, protocolos, treinamentos e prioridades conectados em uma visão de gestão.",
              },
              {
                icon: HeartPulse,
                n: "02",
                title: "Pessoas no centro",
                text: "Saúde, segurança e condições de trabalho como parte da rotina da instituição.",
              },
              {
                icon: Network,
                n: "03",
                title: "Apoio durante o ano",
                text: "Implantação e uma reunião estratégica por mês. Você não precisa conduzir tudo sozinho.",
              },
            ].map((v) => (
              <article className="value-card" key={v.n}>
                <div>
                  <v.icon size={27} />
                  <span>{v.n}</span>
                </div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section modern-fronteirs" id="como-ajuda">
        <div className="container">
          <div className="modern-section-heading">
            <div>
              <span className="eyebrow">
                ESCOLHA UMA FRENTE. VEJA A CONEXÃO.
              </span>
              <h2>
                Três formas de cuidar.
                <br />
                <span>Um programa conectado.</span>
              </h2>
            </div>
            <p>
              Explore cada área e veja
              <br />
              como ela pode ajudar na prática.
            </p>
          </div>
          <SolutionExplorer />
          <div className="central-note">
            <span>
              <Network size={23} />
            </span>
            <p>
              <strong>Uma Central de Inteligência conecta tudo.</strong> Dados
              organizados, planos de ação e evidências para acompanhar as
              prioridades.
            </p>
            <Link
              href="/central-de-inteligencia"
              aria-label="Conhecer a Central de Inteligência"
            >
              Conhecer a central <ArrowUpRight size={19} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section everyday-section">
        <div className="container">
          <div className="modern-section-heading">
            <div>
              <span className="eyebrow">
                RECONHECE ALGUMA DESSAS SITUAÇÕES?
              </span>
              <h2>
                A rotina já é complexa.
                <br />
                <span>Entender o próximo passo pode ser simples.</span>
              </h2>
            </div>
          </div>
          <EverydayScenarios />
        </div>
      </section>
      <section className="section modern-demo" id="painel">
        <div className="container">
          <div className="modern-section-heading">
            <div>
              <span className="eyebrow light">
                MENOS INFORMAÇÃO SOLTA. MAIS VISÃO DO TODO.
              </span>
              <h2>
                O que merece atenção?
                <br />
                <span>O painel ajuda a enxergar.</span>
              </h2>
            </div>
            <div>
              <p>
                Explore as abas e o período.
                <br />
                Veja como as informações se conectam.
              </p>
              <span className="demo-disclaimer">
                <span className="live-dot" /> DEMONSTRAÇÃO · DADOS FICTÍCIOS
              </span>
            </div>
          </div>
          <div className="modern-dashboard-wrap">
            <Dashboard full />
          </div>
          <div className="demo-bottom">
            <span>
              <ShieldCheck size={16} /> Treinamentos e prontidão
            </span>
            <span>
              <HeartPulse size={16} /> Saúde e bem-estar
            </span>
            <span>
              <Layers size={16} /> Planos e próximos passos
            </span>
          </div>
        </div>
      </section>
      <section className="section modern-process">
        <div className="container">
          <div className="modern-section-heading">
            <div>
              <span className="eyebrow">
                COMEÇAMOS JUNTOS. SEGUIMOS POR PERTO.
              </span>
              <h2>
                Um começo estruturado.
                <br />
                <span>Um cuidado que continua.</span>
              </h2>
            </div>
            <p>
              Toque nas etapas para entender
              <br />
              como o programa acontece.
            </p>
          </div>
          <ProgramJourney />
        </div>
      </section>
      <section className="section modern-extras">
        <div className="container">
          <div className="modern-section-heading">
            <div>
              <span className="eyebrow">O CUIDADO TAMBÉM PODE IR ALÉM</span>
              <h2>
                Mais possibilidades.
                <br />
                <span>Do seu jeito.</span>
              </h2>
            </div>
            <p>
              Serviços complementares, planejados
              <br />e contratados conforme cada proposta.
            </p>
          </div>
          <div className="modern-extra-grid">
            <Link href="/experiencias" className="modern-extra-card">
              <span className="extra-icon">
                <Sparkles size={25} />
              </span>
              <span className="eyebrow">PAUSA, ACOLHIMENTO E COMUNIDADE</span>
              <h3>
                Quem cuida
                <br />
                também precisa
                <br />
                <em>de cuidado.</em>
              </h3>
              <p>
                Conheça as possibilidades de bem-estar, cuidado individual e
                experiências para famílias e profissionais.
              </p>
              <span className="extra-card-link">
                Explorar experiências <ArrowUpRight size={21} />
              </span>
            </Link>
            <Link
              href="/experiencia-digital"
              className="modern-extra-card extra-digital"
            >
              <div className="digital-art" aria-hidden="true">
                <div />
                <div />
                <div />
                <span>
                  nexo<span>✳</span>
                </span>
              </div>
              <span className="eyebrow">EXPERIÊNCIA DIGITAL</span>
              <h3>
                Sua escola mais
                <br />
                conectada com
                <br />
                <em>novas possibilidades.</em>
              </h3>
              <p>
                Sites, conteúdos e recursos digitais desenvolvidos sob medida
                para a instituição.
              </p>
              <span className="extra-card-link">
                Conhecer a Experiência Digital <ArrowUpRight size={21} />
              </span>
            </Link>
          </div>
          <div className="more-paths">
            <Link href="/acreditacao">
              <ShieldCheck size={22} />
              <div>
                <strong>Uma jornada de evolução</strong>
                <span>
                  Conheça a Acreditação NEXO, reconhecimento privado do
                  programa.
                </span>
              </div>
              <ArrowUpRight size={20} />
            </Link>
            <Link href="/visao-de-futuro">
              <Sprout size={22} />
              <div>
                <strong>Começamos pela escola.</strong>
                <span>
                  Descubra nossa visão futura para redes e territórios.
                </span>
              </div>
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section modern-faq-section">
        <div className="container modern-faq-grid">
          <div>
            <span className="eyebrow">VAMOS SIMPLIFICAR?</span>
            <h2>
              Boas perguntas.
              <br />
              <span>Respostas diretas.</span>
            </h2>
            <p>
              Se preferir, a gente conversa
              <br />
              sobre a realidade da sua escola.
            </p>
            <Link href="/contato" className="text-link">
              Fale com a equipe <ArrowUpRight size={17} />
            </Link>
          </div>
          <HomeFAQ />
        </div>
      </section>
      <CTA />
    </div>
  );
}
