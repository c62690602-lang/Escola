import { z } from "zod";
export const permissionKeys = [
  "tasks.write",
  "units.write",
  "reports.read",
  "audit.read",
] as const;
export type Permission = (typeof permissionKeys)[number];
export const permissionsInput = z
  .array(z.enum(permissionKeys))
  .max(permissionKeys.length)
  .transform((values) => [...new Set(values)]);
export const permissionLabels: Record<Permission, string> = {
  "tasks.write": "Criar e atualizar tarefas e implantação",
  "units.write": "Cadastrar e organizar unidades",
  "reports.read": "Consultar e exportar relatório",
  "audit.read": "Consultar trilha de auditoria",
};
export function effectivePermissions(member: {
  role: string;
  permissions?: string[] | null;
}): Permission[] {
  if (member.permissions !== null && member.permissions !== undefined)
    return member.permissions.filter((p): p is Permission =>
      permissionKeys.includes(p as Permission),
    );
  return member.role === "gestor"
    ? [...permissionKeys]
    : ["diretor", "especialista", "rh", "acolhimento"].includes(member.role)
      ? ["reports.read", "audit.read"]
      : [];
}
