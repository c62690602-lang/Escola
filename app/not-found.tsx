import Link from "next/link";
export default function NotFound() {
  return (
    <section className="page-hero">
      <div className="container">
        <span className="eyebrow">404 · VAMOS RECONECTAR</span>
        <h1>Este caminho ainda não existe.</h1>
        <p>Encontre a solução NEXO ou volte à página inicial.</p>
        <Link className="button" href="/">
          Voltar ao início
        </Link>
      </div>
    </section>
  );
}
