import { LoginForm } from "@/components/login-form";
export default function Login() {
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="brand">
          nexo<span>●</span>
        </div>
        <p className="eyebrow">CERTTIFICA APRESENTA</p>
        <h1>
          Inteligência que conecta.
          <br />
          <em>Gestão que transforma.</em>
        </h1>
        <p>
          Um olhar integrado para cuidar de pessoas, organizar prioridades e
          transformar a rotina das instituições de ensino.
        </p>
        <div className="login-note">
          Gestão próxima. Decisões conscientes. Evolução contínua.
        </div>
      </section>
      <section className="login-panel">
        <LoginForm />
        <p className="muted">
          Acesso restrito a profissionais e instituições autorizados.
        </p>
      </section>
    </main>
  );
}
