import Link from "next/link";
import { Brand } from "./navigation";
import { ArrowUpRight } from "./icons";
export default function Footer() {
  return (
    <footer>
      <div className="container footer-top">
        <div>
          <Brand />
          <p>
            Inteligência que conecta.
            <br />
            Gestão que transforma.
          </p>
          <span className="footer-caption">
            Uma solução Certtifica.
            <br />
            Grupo D’Aguiar Consultoria em TI.
          </span>
        </div>
        <div>
          <h3>Explore o NEXO</h3>
          <Link href="/solucao">A solução</Link>
          <Link href="/modulos">Frentes de cuidado</Link>
          <Link href="/como-funciona">Como funciona</Link>
          <Link href="/acreditacao">Acreditação</Link>
        </div>
        <div>
          <h3>Novas conexões</h3>
          <Link href="/sobre">Sobre a Certtifica</Link>
          <Link href="/visao-de-futuro">Visão de futuro</Link>
          <Link href="/conteudos">Conteúdos</Link>
          <Link href="/experiencia-digital">Experiência Digital</Link>
        </div>
        <div>
          <h3>Vamos conversar?</h3>
          <p>
            Um próximo passo para
            <br />o cuidado na sua escola.
          </p>
          <Link href="/contato" className="text-link">
            Entre em contato <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Certtifica · NEXO</span>
        <div>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos de uso</Link>
          <button type="button" data-cookie-settings>
            Preferências de cookies
          </button>
        </div>
      </div>
    </footer>
  );
}
