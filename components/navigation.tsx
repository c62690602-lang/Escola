"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "./icons";
const groups = [
  {
    name: "A solução",
    links: [
      ["Visão geral", "/solucao"],
      ["Módulos do programa", "/modulos"],
      ["Central de Inteligência", "/central-de-inteligencia"],
      ["Como funciona", "/como-funciona"],
    ],
  },
  {
    name: "Cuidado conectado",
    links: [
      ["NEXO Psicossocial", "/psicossocial"],
      ["NEXO Prontidão", "/prontidao"],
      ["SER Saúde na Escola", "/ser-saude"],
      ["Experiências e bem-estar", "/experiencias"],
      ["Experiência Digital", "/experiencia-digital"],
    ],
  },
  {
    name: "Institucional",
    links: [
      ["Sobre a Certtifica", "/sobre"],
      ["Acreditação NEXO", "/acreditacao"],
      ["Visão de futuro", "/visao-de-futuro"],
      ["Conteúdos", "/conteudos"],
      ["Contato", "/contato"],
    ],
  },
];
export function Brand() {
  return (
    <Link
      className="brand"
      href="/"
      aria-label="NEXO por Certtifica, página inicial"
    >
      nexo
      <span className="brand-dot" aria-hidden="true">
        ✳
      </span>
      <span className="brand-by">por certtifica</span>
    </Link>
  );
}
export default function Navigation() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const access = process.env.NEXT_PUBLIC_NEXO_URL;
  const valid = access && /^https:\/\//.test(access);
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Brand />
        <button
          className="menu-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="main-nav"
          aria-label="Principal"
          className={open ? "nav open" : "nav"}
        >
          {groups.map((g) => (
            <details key={g.name} className="nav-group">
              <summary>
                {g.name}
                <span>⌄</span>
              </summary>
              <div className="dropdown">
                {g.links.map(([label, href]) => (
                  <Link
                    aria-current={path === href ? "page" : undefined}
                    onClick={(e) => {
                      setOpen(false);
                      e.currentTarget
                        .closest("details")
                        ?.removeAttribute("open");
                    }}
                    key={href}
                    href={href}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </details>
          ))}
          <div className="nav-actions">
            {valid ? (
              <a
                className="access-link"
                href={access}
                rel="noopener noreferrer"
                target="_blank"
              >
                Acessar NEXO <ArrowUpRight size={14} />
              </a>
            ) : (
              <span
                className="access-link muted"
                title="Endereço do sistema ainda não configurado"
              >
                Acesso em breve
              </span>
            )}
            <Link
              onClick={() => setOpen(false)}
              className="button button-small"
              href="/agendar-apresentacao"
            >
              Agendar apresentação <ArrowUpRight size={16} />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
