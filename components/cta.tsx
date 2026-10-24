import Link from "next/link";
import { ArrowUpRight } from "./icons";
export default function CTA() {
  return (
    <section className="cta-section">
      <div className="container cta-inner">
        <div>
          <span className="eyebrow light">O PRÓXIMO PASSO É UMA CONVERSA</span>
          <h2>
            Uma nova conexão.
            <br />
            Um novo jeito de cuidar.
          </h2>
          <p>
            Vamos entender a realidade da sua instituição
            <br />e construir uma proposta que faça sentido para ela.
          </p>
        </div>
        <Link className="button button-mint" href="/agendar-apresentacao">
          Agendar uma apresentação <ArrowUpRight size={18} />
        </Link>
        <div className="cta-orbit" aria-hidden="true" />
      </div>
    </section>
  );
}
