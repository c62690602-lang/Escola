"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  HeartPulse,
  ShieldCheck,
  Sprout,
  CalendarDays,
  Layers,
  Network,
} from "./icons";
import { Pause, Play, ArrowRight, Plus, Minus } from "lucide-react";
const fronts = [
  {
    name: "Pessoas",
    title: "Uma rotina de trabalho com mais cuidado.",
    description:
      "Organize medidas preventivas para fatores psicossociais relacionados ao trabalho, com responsáveis e acompanhamento.",
    label: "NEXO Psicossocial",
    href: "/psicossocial",
    icon: HeartPulse,
    items: [
      "Identificar necessidades da equipe",
      "Priorizar melhorias na organização",
      "Acompanhar medidas preventivas",
    ],
    example: "Sobrecarga em um dos turnos",
    action: "Revisar a distribuição de atividades",
    owner: "Gestão + acompanhamento técnico",
  },
  {
    name: "Prontidão",
    title: "Uma equipe que continua se preparando.",
    description:
      "Conecte capacitações, novos colaboradores e revisões práticas para acompanhar a preparação em primeiros socorros.",
    label: "NEXO Prontidão",
    href: "/prontidao",
    icon: ShieldCheck,
    items: [
      "Organizar capacitações e simulações",
      "Integrar quem acaba de chegar",
      "Manter histórico e próximas revisões",
    ],
    example: "Novos profissionais na escola",
    action: "Planejar a capacitação inicial",
    owner: "Coordenação + equipe de capacitação",
  },
  {
    name: "Saúde",
    title: "Prevenção que faz parte do calendário.",
    description:
      "Planeje campanhas e orientações de saúde para a equipe e as famílias, de acordo com a realidade da comunidade escolar.",
    label: "SER Saúde na Escola",
    href: "/ser-saude",
    icon: Sprout,
    items: [
      "Planejar ações durante o ano",
      "Organizar protocolos e orientações",
      "Envolver profissionais e famílias",
    ],
    example: "Retorno às aulas e cuidados sazonais",
    action: "Organizar uma ação educativa",
    owner: "Instituição + equipe de saúde",
  },
];
export function HeroNetwork() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const f = fronts[active];
  const Icon = f.icon;
  return (
    <div className={`network-scene ${paused ? "is-paused" : ""}`}>
      <div className="scene-topline">
        <span>
          <span className="live-dot" /> CUIDADO EM CONEXÃO
        </span>
        <span>NEXO / 01</span>
      </div>
      <div className="network-map">
        <div className="network-ring ring-a" aria-hidden="true" />
        <div className="network-ring ring-b" aria-hidden="true" />
        <div className="network-ring ring-c" aria-hidden="true" />
        <svg className="network-lines" viewBox="0 0 520 330" aria-hidden="true">
          <path d="M260 166L95 88M260 166L427 93M260 166L354 284" />
        </svg>
        <div className="network-center">
          <span className="center-spark">✳</span>
          <strong>nexo</strong>
          <span>INTELIGÊNCIA QUE CONECTA</span>
        </div>
        {fronts.map((front, i) => {
          const FrontIcon = front.icon;
          return (
            <button
              key={front.name}
              className={`network-node node-${i} ${active === i ? "selected" : ""}`}
              onClick={() => setActive(i)}
              aria-pressed={active === i}
            >
              <span>
                <FrontIcon size={20} />
              </span>
              {front.name}
              <ArrowUpRight size={13} />
            </button>
          );
        })}
        <div className="scene-ping ping-one" aria-hidden="true" />
        <div className="scene-ping ping-two" aria-hidden="true" />
      </div>
      <div className="scene-insight" key={f.name}>
        <span className="insight-icon">
          <Icon size={22} />
        </span>
        <div>
          <span>{f.label}</span>
          <strong>{f.title}</strong>
        </div>
        <Check size={17} />
      </div>
      <div className="scene-bottom">
        <span>Toque em uma frente para explorar.</span>
        <button
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "Retomar animações" : "Pausar animações"}
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}
          <span>{paused ? "Retomar" : "Pausar"}</span>
        </button>
      </div>
    </div>
  );
}
export function SolutionExplorer() {
  const [active, setActive] = useState(0);
  const f = fronts[active];
  const Icon = f.icon;
  return (
    <div className="solution-explorer">
      <div
        className="front-switch"
        role="tablist"
        aria-label="Frentes de cuidado"
      >
        {fronts.map((front, i) => (
          <button
            id={`front-tab-${i}`}
            aria-controls="front-panel"
            role="tab"
            aria-selected={active === i}
            tabIndex={active === i ? 0 : -1}
            key={front.name}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              const next =
                e.key === "ArrowRight"
                  ? (i + 1) % 3
                  : e.key === "ArrowLeft"
                    ? (i + 2) % 3
                    : e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 2
                        : -1;
              if (next !== -1) {
                e.preventDefault();
                setActive(next);
                document.getElementById(`front-tab-${next}`)?.focus();
              }
            }}
          >
            <front.icon size={19} />
            <span>{front.name}</span>
            <small>0{i + 1}</small>
          </button>
        ))}
      </div>
      <div
        id="front-panel"
        role="tabpanel"
        aria-labelledby={`front-tab-${active}`}
        tabIndex={0}
        className="front-panel"
      >
        <div className="front-copy" key={f.name}>
          <span className="pill-label">
            <Icon size={15} />
            {f.label}
          </span>
          <h3>{f.title}</h3>
          <p>{f.description}</p>
          <ul>
            {f.items.map((item) => (
              <li key={item}>
                <Check size={16} />
                {item}
              </li>
            ))}
          </ul>
          <Link href={f.href} className="text-link">
            Conhecer esta frente <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="scenario-card">
          <div className="scenario-heading">
            <span className="live-dot" /> NA PRÁTICA{" "}
            <span>EXEMPLO ILUSTRATIVO</span>
          </div>
          <div className="scenario-situation">
            <span>01 / O QUE MERECE ATENÇÃO</span>
            <h4>{f.example}</h4>
          </div>
          <div className="scenario-connector">
            <ArrowRight size={19} />
          </div>
          <div className="scenario-action">
            <span>02 / UM PRÓXIMO PASSO POSSÍVEL</span>
            <h4>{f.action}</h4>
            <div>
              <span className="mini-avatar">N</span>
              <p>
                {f.owner}
                <small>Responsável + ação + acompanhamento</small>
              </p>
              <Check size={15} />
            </div>
          </div>
          <p className="scenario-note">
            Exemplo de uso. Ações e resultados dependem do contexto de cada
            instituição.
          </p>
        </div>
      </div>
    </div>
  );
}
const steps = [
  {
    time: "COMEÇAMOS AQUI",
    name: "Conhecer",
    title: "Primeiro, entender a sua escola.",
    text: "Conhecemos a instituição, ouvimos as necessidades e analisamos documentos e processos. O ponto de partida é a sua realidade.",
    items: [
      "Diagnóstico inicial",
      "Levantamento de necessidades",
      "Definição das prioridades",
    ],
  },
  {
    time: "PRIMEIROS 60 DIAS",
    name: "Organizar",
    title: "Depois, construir uma base clara.",
    text: "Organizamos as frentes do programa, configuramos a plataforma e estruturamos os primeiros planos, capacitações e indicadores.",
    items: [
      "Implantação dos módulos",
      "Capacitação inicial",
      "Planos e primeiros indicadores",
    ],
  },
  {
    time: "DURANTE TODO O ANO",
    name: "Acompanhar",
    title: "O cuidado continua. A gestão também.",
    text: "Uma reunião estratégica por mês para revisar ações, acompanhar o que evoluiu e definir a próxima prioridade com a equipe técnica.",
    items: [
      "Monitoramento de ações e prazos",
      "Integração de novos colaboradores",
      "Revisão mensal de prioridades",
    ],
  },
];
export function ProgramJourney() {
  const [active, setActive] = useState(0);
  const step = steps[active];
  return (
    <div className="program-journey">
      <div
        className="journey-tabs"
        role="tablist"
        aria-label="Etapas do programa"
      >
        {steps.map((s, i) => (
          <button
            role="tab"
            id={`journey-tab-${i}`}
            aria-controls="journey-panel"
            aria-selected={active === i}
            tabIndex={active === i ? 0 : -1}
            key={s.name}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              const next =
                e.key === "ArrowRight"
                  ? (i + 1) % 3
                  : e.key === "ArrowLeft"
                    ? (i + 2) % 3
                    : e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 2
                        : -1;
              if (next >= 0) {
                e.preventDefault();
                setActive(next);
                document.getElementById(`journey-tab-${next}`)?.focus();
              }
            }}
          >
            <span>0{i + 1}</span>
            <div>
              <small>{s.time}</small>
              <strong>{s.name}</strong>
            </div>
            <ArrowUpRight size={18} />
          </button>
        ))}
      </div>
      <div
        className="journey-panel"
        id="journey-panel"
        role="tabpanel"
        aria-labelledby={`journey-tab-${active}`}
        tabIndex={0}
      >
        <div key={step.name}>
          <span className="eyebrow">
            UM PROGRAMA ANUAL. UMA CONSTRUÇÃO CONTÍNUA.
          </span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
          <ul>
            {step.items.map((item) => (
              <li key={item}>
                <Check size={16} />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/como-funciona" className="text-link">
            Ver a jornada completa <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="monthly-card">
          <span className="monthly-icon">
            <CalendarDays size={31} />
          </span>
          <span>TECNOLOGIA + PESSOAS</span>
          <strong>
            1 encontro.
            <br />
            Todo mês.
            <br />
            <em>Novos caminhos.</em>
          </strong>
          <p>
            O que evoluiu?
            <br />O que precisa de atenção?
            <br />
            Qual é a próxima prioridade?
          </p>
        </div>
      </div>
    </div>
  );
}
const situations = [
  {
    question: "As informações estão espalhadas?",
    before:
      "Documentos em pastas diferentes, lembretes em conversas e prioridades que dependem da memória.",
    after:
      "Informações organizadas, evidências reunidas e próximos passos visíveis para a gestão.",
    icon: Layers,
  },
  {
    question: "A equipe mudou. E os treinamentos?",
    before:
      "Uma nova contratação pode passar despercebida na programação de capacitações e revisões.",
    after:
      "Histórico e planejamento ajudam a identificar quem precisa participar das próximas ações.",
    icon: ShieldCheck,
  },
  {
    question: "A prevenção fica para depois?",
    before:
      "Na correria, campanhas e medidas preventivas acabam disputando espaço com as urgências.",
    after:
      "Um calendário acompanhado ajuda a planejar ações e retomar as prioridades a cada mês.",
    icon: HeartPulse,
  },
];
export function EverydayScenarios() {
  const [selected, setSelected] = useState(0);
  const [organized, setOrganized] = useState(true);
  const s = situations[selected];
  return (
    <div className="everyday">
      <div className="situation-choices" aria-label="Situações da rotina">
        {situations.map((v, i) => (
          <button
            key={v.question}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            <v.icon size={21} />
            <span>{v.question}</span>
            <ArrowUpRight size={17} />
          </button>
        ))}
      </div>
      <div className={`situation-result ${organized ? "organized" : ""}`}>
        <div
          className="comparison-switch"
          role="group"
          aria-label="Comparar organização da rotina"
        >
          <button aria-pressed={!organized} onClick={() => setOrganized(false)}>
            Informações dispersas
          </button>
          <button aria-pressed={organized} onClick={() => setOrganized(true)}>
            Com o NEXO
          </button>
        </div>
        <div className="comparison-symbol" aria-hidden="true">
          {organized ? <Network size={38} /> : <Layers size={38} />}
        </div>
        <span className="eyebrow">
          {organized ? "CONEXÃO PARA ACOMPANHAR" : "UMA CENA COMUM NA ROTINA"}
        </span>
        <p key={`${selected}-${organized}`}>{organized ? s.after : s.before}</p>
        <small>
          Uma possibilidade de organização, sem promessa de resultado garantido.
        </small>
      </div>
    </div>
  );
}
const faqs = [
  {
    q: "O NEXO é só um software?",
    a: "Não. É um programa anual que combina plataforma digital, implantação, acompanhamento técnico e gestão preventiva. Você conta com uma reunião estratégica por mês para revisar prioridades.",
  },
  {
    q: "Preciso contratar todas as experiências?",
    a: "As experiências de bem-estar, cuidado individual e modernização digital são complementares. O escopo é planejado com a instituição e definido em proposta personalizada.",
  },
  {
    q: "O NEXO substitui o sistema que minha escola já usa?",
    a: "O foco do NEXO é saúde, segurança, prevenção e inteligência de gestão. Ele não é um sistema de notas, matrículas ou controle financeiro e não precisa substituir o ERP acadêmico da escola.",
  },
  {
    q: "A acreditação garante conformidade legal?",
    a: "Não. A Acreditação NEXO é um reconhecimento privado próprio do programa Certtifica. Não é acreditação governamental nem garantia automática de conformidade com NR-1, Lei Lucas ou outras normas.",
  },
  {
    q: "Como recebo uma proposta para a minha escola?",
    a: "Preencha a solicitação de apresentação. A equipe poderá conhecer sua realidade, explicar as possibilidades e preparar uma proposta personalizada. O envio do formulário não confirma uma data de reunião.",
  },
];
export function HomeFAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="home-faq">
      {faqs.map((f, i) => (
        <div className={`faq-item ${open === i ? "expanded" : ""}`} key={f.q}>
          <h3>
            <button
              id={`faq-question-${i}`}
              aria-expanded={open === i}
              aria-controls={`faq-answer-${i}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span>{f.q}</span>
              {open === i ? <Minus size={20} /> : <Plus size={20} />}
            </button>
          </h3>
          <div
            id={`faq-answer-${i}`}
            role="region"
            aria-labelledby={`faq-question-${i}`}
            hidden={open !== i}
          >
            <p>{f.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
