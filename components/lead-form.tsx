"use client";
import { useState } from "react";
import Link from "next/link";
import { interests } from "@/lib/validation";
import { ArrowUpRight } from "./icons";
export default function LeadForm({ schedule = false }: { schedule?: boolean }) {
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<{ error?: string; reference?: string }>(
    {},
  );
  const [pending, setPending] = useState(false);
  async function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setStatus({});
    const form = e.currentTarget;
    const f = new FormData(form);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(f),
          privacy: f.has("privacy"),
          marketing: f.has("marketing"),
          startedAt,
          source: schedule ? "agendamento" : "contato",
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setStatus({
          error: result.error || "Não foi possível enviar. Tente novamente.",
        });
        return;
      }
      setStatus({ reference: result.reference });
      form.reset();
    } catch {
      setStatus({
        error: "Falha de conexão. Confira sua rede e tente novamente.",
      });
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="contact-form"
      aria-label="Solicitação de contato"
    >
      <div className="form-grid">
        {[
          { name: "name", label: "Seu nome", auto: "name", max: 120 },
          {
            name: "institution",
            label: "Nome da instituição",
            auto: "organization",
            max: 180,
          },
          {
            name: "role",
            label: "Seu cargo",
            auto: "organization-title",
            max: 100,
          },
          {
            name: "city",
            label: "Cidade / UF",
            auto: "address-level2",
            max: 120,
          },
          {
            name: "email",
            label: "E-mail profissional",
            auto: "email",
            type: "email",
            max: 254,
          },
          {
            name: "phone",
            label: "Telefone / WhatsApp",
            auto: "tel",
            type: "tel",
            max: 30,
          },
        ].map((f) => (
          <div className="field" key={f.name}>
            <label htmlFor={f.name}>{f.label} *</label>
            <input
              id={f.name}
              name={f.name}
              type={f.type || "text"}
              autoComplete={f.auto}
              maxLength={f.max}
              required
              minLength={f.name === "phone" ? 10 : 2}
            />
          </div>
        ))}
        <div className="field">
          <label htmlFor="employees">
            Colaboradores <small>(opcional)</small>
          </label>
          <input
            id="employees"
            name="employees"
            type="number"
            min="1"
            max="999999"
            step="1"
            inputMode="numeric"
          />
        </div>
        <div className="field">
          <label htmlFor="units">
            Unidades escolares <small>(opcional)</small>
          </label>
          <input
            id="units"
            name="units"
            type="number"
            min="1"
            max="999999"
            step="1"
            inputMode="numeric"
          />
        </div>
        <div className="field full">
          <label htmlFor="interest">Principal interesse *</label>
          <select id="interest" name="interest" required defaultValue="">
            <option value="" disabled>
              O que faz sentido para sua escola?
            </option>
            {interests.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="field full">
          <label htmlFor="message">
            Como podemos ajudar? <small>(opcional)</small>
          </label>
          <textarea
            id="message"
            name="message"
            maxLength={2000}
            placeholder="Conte um pouco sobre a sua instituição."
          />
          <small>
            Não envie informações de saúde, dados de alunos ou outros dados
            sensíveis.
          </small>
        </div>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Não preencher</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="form-check">
        <input type="checkbox" name="privacy" required />
        <span>
          Li o{" "}
          <Link href="/privacidade" target="_blank">
            aviso de privacidade
          </Link>{" "}
          e estou ciente do tratamento dos meus dados para responder a esta
          solicitação. *
        </span>
      </label>
      <label className="form-check">
        <input type="checkbox" name="marketing" />
        <span>
          Quero receber comunicações adicionais sobre o NEXO. Esta escolha é
          opcional e pode ser revogada.
        </span>
      </label>
      <button
        className="button form-submit"
        type="submit"
        disabled={pending || !!status.reference}
      >
        {pending
          ? "Registrando solicitação…"
          : status.reference
            ? "Solicitação registrada"
            : schedule
              ? "Solicitar uma apresentação"
              : "Enviar solicitação"}
        <ArrowUpRight size={18} />
      </button>
      <p className="form-footnote">
        * Campos obrigatórios · Apresentação sem compromisso.
        <br />O envio solicita contato; não confirma uma data de reunião.
      </p>
      <div aria-live="polite" aria-atomic="true">
        {status.error && (
          <p className="form-status error" role="alert">
            {status.error}
          </p>
        )}
        {status.reference && (
          <p className="form-status">
            Solicitação registrada com sucesso. A equipe poderá consultar seu
            contato e combinar os próximos passos.
            <br />
            Protocolo: {status.reference}
          </p>
        )}
      </div>
    </form>
  );
}
