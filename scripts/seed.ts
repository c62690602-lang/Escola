import { randomUUID } from "node:crypto";
import { db, pool } from "../src/lib/db";
import { users, institutions, memberships } from "../src/lib/schema";
import { hashPassword } from "../src/lib/auth";
if (process.env.DEMO_MODE !== "true")
  throw new Error("Seed permitido apenas com DEMO_MODE=true");
const password = process.env.DEMO_PASSWORD;
if (!password || password.length < 14)
  throw new Error("Defina DEMO_PASSWORD com pelo menos 14 caracteres");
await db.transaction(async (tx) => {
  const [admin] = await tx
    .insert(users)
    .values({
      id: randomUUID(),
      name: "Equipe Certtifica · Demonstração",
      email: "admin@nexo.example",
      passwordHash: await hashPassword(password),
      platformAdmin: true,
    })
    .onConflictDoNothing()
    .returning();
  if (!admin) {
    console.log("Demonstração já existe; nenhum dado foi alterado.");
    return;
  }
  const [school] = await tx
    .insert(institutions)
    .values({
      id: randomUUID(),
      name: "Instituição Demonstração · Fictícia",
      city: "São Paulo",
      state: "SP",
      status: "implantacao",
    })
    .returning();
  const [director] = await tx
    .insert(users)
    .values({
      id: randomUUID(),
      name: "Direção · Demonstração",
      email: "diretor@nexo.example",
      passwordHash: await hashPassword(password),
      platformAdmin: false,
    })
    .returning();
  await tx
    .insert(memberships)
    .values({ userId: director.id, institutionId: school.id, role: "diretor" });
  console.log(
    "Demonstração criada. Usuários: admin@nexo.example e diretor@nexo.example. Sem indicadores inventados.",
  );
});
await pool.end();
