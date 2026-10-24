"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="error-page container">
      <span className="eyebrow">VAMOS TENTAR NOVAMENTE</span>
      <h1>Não foi possível carregar esta página.</h1>
      <p>Tente novamente em instantes.</p>
      <button className="button" onClick={reset}>
        Tentar novamente
      </button>
    </section>
  );
}
