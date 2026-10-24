import Link from "next/link";
import Dashboard from "@/components/dashboard";
import CTA from "@/components/cta";
import {
  ArrowUpRight,
  ArrowRight,
  HeartPulse,
  ShieldCheck,
  Sprout,
  Check,
  Layers,
  Network,
  Sparkles,
} from "@/components/icons";
import { moduleLinks } from "@/lib/content";
export const metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="container hero-content">
          <span className="eyebrow">
            <span className="live-dot" /> CERTTIFICA APRESENTA
          </span>
          <div className="hero-wordmark">
            nexo<span className="wordmark-spark">✳</span>
          </div>
          <p className="hero-signature">
            Inteligência que conecta. Gestão que transforma.
          </p>
          <h1>
            Uma escola mais tranquila para gerir,
            <br className="desktop-break" /> melhor para trabalhar e{" "}
            <em>mais segura para confiar.</em>
          </h1>
          <p className="hero-description">
            Uma solução integrada que conecta gestão, saúde, segurança,
            prevenção, bem-estar e tecnologia para acompanhar a evolução da sua
            instituição durante todo o ano.
          </p>
          <div className="hero-buttons">
            <Link className="button" href="/solucao">
              Conhecer o NEXO <ArrowRight size={17} />
            </Link>
            <Link
              className="button button-outline"
              href="/agendar-apresentacao"
            >
              Agendar uma apresentação <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="hero-proof">
            <span>
              <Check size={13} /> Plataforma + acompanhamento técnico
            </span>
            <span>
              <Check size={13} /> Cuidado durante todo o ano
            </span>
          </div>
        </div>
        <div className="container dashboard-stage">
          <div className="floating-label label-left">
            <span className="floating-icon">
              <HeartPulse size={20} />
            </span>
            <div>
              Cuidado conectado<strong>Pessoas no centro.</strong>
            </div>
            <span className="live-dot" />
          </div>
          <Dashboard />
          <div className="floating-label label-right">
            <span className="floating-icon">
              <ShieldCheck size={20} />
            </span>
            <div>
              Gestão preventiva<strong>Um passo à frente.</strong>
            </div>
          </div>
        </div>
        <div className="container hero-caption">
          <span>UMA VISÃO INTEGRADA PARA QUEM CUIDA DA EDUCAÇÃO</span>
          <span>Painel conceitual · Dados fictícios</span>
        </div>
      </section>
      <section className="trust-strip">
        <div className="container trust-content">
          <span>
            TECNOLOGIA COM PROPÓSITO.
            <br />
            <strong>ACOMPANHAMENTO DE VERDADE.</strong>
          </span>
          <div>
            <HeartPulse /> Saúde e bem-estar
          </div>
          <div>
            <ShieldCheck /> Segurança e prevenção
          </div>
          <div>
            <Network /> Inteligência de gestão
          </div>
        </div>
      </section>
      <section className="section challenges">
        <div className="container two-col">
          <div>
            <span className="eyebrow">
              A ROTINA É COMPLEXA. O CUIDADO PODE SER CONECTADO.
            </span>
            <h2>
              Gerir uma escola é cuidar
              <br />
              de muito mais
              <br />
              do que <span className="serif-word">ensinar.</span>
            </h2>
          </div>
          <div>
            <p className="lead">
              Entre pessoas, prazos e imprevistos, quem cuida da escola também
              precisa de apoio.
            </p>
            <p>
              Novas contratações, capacitações, documentos, saúde e segurança.
              Demandas de famílias e profissionais, emergências e fatores
              psicossociais relacionados ao trabalho.
            </p>
            <p>
              Não é falta de dedicação. Muitas vezes, faltam tempo, informações
              conectadas e acompanhamento para que a prevenção encontre espaço
              na rotina.
            </p>
            <Link className="text-link" href="/solucao">
              É aqui que o NEXO conecta <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="container journey-strip">
          {[
            "Antecipar",
            "Organizar",
            "Cuidar",
            "Acompanhar",
            "Comprovar",
            "Evoluir",
          ].map((t, i) => (
            <div key={t}>
              <span>0{i + 1}</span>
              <strong>{t}</strong>
              {i < 5 && <ArrowRight size={15} />}
            </div>
          ))}
        </div>
      </section>
      <section className="section ecosystem" id="modulos">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">UM ECOSSISTEMA. VÁRIAS CONEXÕES.</span>
              <h2>
                Três frentes de cuidado.
                <br />
                <span className="serif-word">Uma gestão mais completa.</span>
              </h2>
            </div>
            <Link className="text-link" href="/modulos">
              Explore a solução <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="module-grid">
            {moduleLinks.map((m, i) => {
              const Icon = [HeartPulse, ShieldCheck, Sprout][i];
              return (
                <Link
                  className={`module-card module-${i}`}
                  href={m.href}
                  key={m.href}
                >
                  <div className="module-top">
                    <span className="module-icon">
                      <Icon size={27} />
                    </span>
                    <span>{m.tag} / NEXO</span>
                  </div>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                  <div className="module-bottom">
                    <span>Conhecer esta frente</span>
                    <ArrowUpRight size={20} />
                  </div>
                </Link>
              );
            })}
          </div>
          <Link href="/central-de-inteligencia" className="intelligence-band">
            <span className="intelligence-icon">
              <Network size={28} />
            </span>
            <div>
              <span className="eyebrow">A CONEXÃO ENTRE TODAS AS FRENTES</span>
              <h3>Central de Inteligência NEXO</h3>
              <p>
                Informações organizadas. Prioridades visíveis. Decisões com
                contexto.
              </p>
            </div>
            <span className="round-arrow">
              <ArrowUpRight />
            </span>
          </Link>
        </div>
      </section>
      <section className="section continuous">
        <div className="container two-col">
          <div
            className="connection-art"
            aria-label="Plataforma, equipe técnica e instituição conectadas"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="connection-core">
              nexo<span>CONEXÕES QUE CUIDAM</span>
            </div>
            <span className="orbit-node node-one">
              <Layers size={20} /> Plataforma digital
            </span>
            <span className="orbit-node node-two">
              <HeartPulse size={20} /> Equipe técnica
            </span>
            <span className="orbit-node node-three">
              <Network size={20} /> Sua instituição
            </span>
            <span className="orbit-small one" />
            <span className="orbit-small two" />
          </div>
          <div>
            <span className="eyebrow">MUITO ALÉM DO ACESSO A UM SOFTWARE</span>
            <h2>
              Você não precisa
              <br />
              fazer tudo <span className="serif-word">sozinho.</span>
            </h2>
            <p className="lead">
              Tecnologia para organizar.
              <br />
              Pessoas para acompanhar.
            </p>
            <p>
              O NEXO combina plataforma digital, implementação e acompanhamento
              técnico. Um programa anual com ações preventivas e uma reunião
              estratégica por mês para transformar informação em movimento.
            </p>
            <ul className="check-list">
              <li>
                <Check /> Implantação estruturada nos primeiros 60 dias
              </li>
              <li>
                <Check /> Planos com responsáveis, prazos e evidências
              </li>
              <li>
                <Check /> Acompanhamento mensal das próximas prioridades
              </li>
            </ul>
            <Link href="/como-funciona" className="text-link">
              Entenda a jornada do programa <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section care-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">O CUIDADO GANHA NOVOS ESPAÇOS</span>
              <h2>
                Mais presença.
                <br />
                <span className="serif-word">Mais possibilidades.</span>
              </h2>
            </div>
            <p>
              Experiências complementares, planejadas
              <br />
              para a realidade de cada instituição.
            </p>
          </div>
          <div className="care-grid">
            <Link href="/experiencias" className="care-card">
              <Sparkles />
              <span>01 / BEM-ESTAR</span>
              <h3>
                Uma pausa que
                <br />
                também é cuidado.
              </h3>
              <p>
                Espaço Pausa, acolhimento e valorização de quem faz a escola
                acontecer.
              </p>
              <ArrowUpRight />
            </Link>
            <Link href="/experiencias" className="care-card">
              <HeartPulse />
              <span>02 / COMUNIDADE</span>
              <h3>
                Famílias próximas.
                <br />
                Uma rede mais forte.
              </h3>
              <p>
                Saúde, prevenção e experiências que conectam a comunidade
                escolar.
              </p>
              <ArrowUpRight />
            </Link>
            <Link href="/experiencia-digital" className="care-card">
              <Layers />
              <span>03 / EXPERIÊNCIA DIGITAL</span>
              <h3>
                Sua escola, conectada
                <br />a novas oportunidades.
              </h3>
              <p>
                Presença digital, conteúdos e recursos desenvolvidos sob medida.
              </p>
              <ArrowUpRight />
            </Link>
          </div>
          <p className="section-note">
            Serviços complementares sujeitos a planejamento e contratação
            específica.
          </p>
        </div>
      </section>
      <section className="section accreditation-home">
        <div className="container two-col">
          <div>
            <span className="eyebrow">ACREDITAÇÃO NEXO</span>
            <h2>
              Cada evolução
              <br />
              merece ser <span className="serif-word">reconhecida.</span>
            </h2>
            <p>
              Uma jornada de estruturação e melhoria contínua. Três níveis de
              reconhecimento privado do programa Certtifica.
            </p>
            <Link className="text-link" href="/acreditacao">
              Conhecer a acreditação <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="seal-group">
            {["Essencial", "Avançado", "Excelência"].map((s, i) => (
              <div className={`seal seal-${i}`} key={s}>
                <ShieldCheck size={34} />
                <span>NEXO</span>
                <strong>{s}</strong>
                <small>NÍVEL 0{i + 1}</small>
              </div>
            ))}
            <p>
              Selos ilustrativos · Não representam concessões efetivas.
              <br />
              Reconhecimento privado, sem certificação de conformidade legal.
            </p>
          </div>
        </div>
      </section>
      <section className="future-teaser">
        <div className="container">
          <span className="eyebrow light">VISÃO DE FUTURO</span>
          <h2>
            Começamos pela escola.
            <br />
            <span>Pensamos no território.</span>
          </h2>
          <div className="future-track">
            <span>NEXO Escolas</span>
            <ArrowRight />
            <span>Rede NEXO</span>
            <ArrowRight />
            <span>Observatório</span>
            <ArrowRight />
            <span>Municípios</span>
            <ArrowRight />
            <span>Cidades inteligentes</span>
          </div>
          <p>
            Uma visão de expansão para conectar informações e fortalecer
            comunidades.
          </p>
          <Link className="text-link" href="/visao-de-futuro">
            Conheça o que nos move <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <CTA />
    </>
  );
}
