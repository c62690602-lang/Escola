export const interests = [
  "Programa completo",
  "NEXO Psicossocial",
  "NEXO Prontidão",
  "SER Saúde na Escola",
  "Experiências e bem-estar",
  "Experiência Digital",
];
export type LeadInput = {
  name: string;
  institution: string;
  role: string;
  city: string;
  email: string;
  phone: string;
  employees: string;
  units: string;
  interest: string;
  message: string;
  privacy: true;
  marketing: boolean;
};
export function validateLead(
  raw: unknown,
): { data: LeadInput } | { error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    return { error: "Dados inválidos." };
  const r = raw as Record<string, unknown>;
  const clean = (k: string, max: number) =>
    typeof r[k] === "string" ? r[k].trim().slice(0, max + 1) : "";
  const data = {
    name: clean("name", 120),
    institution: clean("institution", 180),
    role: clean("role", 100),
    city: clean("city", 120),
    email: clean("email", 254).toLowerCase(),
    phone: clean("phone", 30),
    employees: clean("employees", 6),
    units: clean("units", 6),
    interest: clean("interest", 80),
    message: clean("message", 2000),
    privacy: r.privacy,
    marketing: r.marketing === true,
  };
  for (const [key, max] of Object.entries({
    name: 120,
    institution: 180,
    role: 100,
    city: 120,
    email: 254,
    phone: 30,
    interest: 80,
    message: 2000,
    employees: 6,
    units: 6,
  })) {
    const v = data[key as keyof typeof data];
    if (
      typeof v === "string" &&
      (v.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(v))
    )
      return { error: "Há campos com conteúdo inválido ou muito longo." };
  }
  if (
    [data.name, data.institution, data.role, data.city].some(
      (v) => v.length < 2,
    )
  )
    return { error: "Preencha nome, instituição, cargo e cidade/UF." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return { error: "Informe um e-mail válido." };
  if (
    !/^[+\d\s().-]+$/.test(data.phone) ||
    data.phone.replace(/\D/g, "").length < 10 ||
    data.phone.replace(/\D/g, "").length > 15
  )
    return { error: "Informe um telefone com DDD válido." };
  if (!interests.includes(data.interest))
    return { error: "Selecione um interesse válido." };
  if (
    [data.employees, data.units].some(
      (v) => v !== "" && !/^[1-9]\d{0,5}$/.test(v),
    )
  )
    return {
      error:
        "Informe quantidades inteiras positivas ou deixe os campos opcionais vazios.",
    };
  if (data.privacy !== true)
    return {
      error:
        "É necessário confirmar a ciência do aviso de privacidade para solicitar contato.",
    };
  return { data: { ...data, privacy: true } };
}
