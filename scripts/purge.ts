import { query } from "../lib/db";
async function main() {
  const days = Number(process.argv[2] || 180);
  if (!Number.isInteger(days) || days < 1)
    throw Error("Informe um número inteiro de dias >= 1");
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  await query("DELETE FROM leads WHERE created_at < $1", [cutoff]);
  console.log(
    `Expurgo concluído para contatos anteriores a ${cutoff}. Nenhum dado pessoal exibido.`,
  );
  process.exit(0);
}
main().catch(() => {
  console.error("Falha no expurgo. Verifique a configuração do banco.");
  process.exitCode = 1;
});
