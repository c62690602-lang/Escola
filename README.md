# NEXO · Certtifica

**Inteligência que conecta. Gestão que transforma.**

Fundação executável de um SaaS para acompanhamento de instituições de ensino. Esta entrega cobre um fluxo operacional inicial real; não é o produto completo nem está liberada para dados reais ou comercialização.

## Executar na nuvem

Pré-requisitos: Node.js 24, npm 11, Docker com Compose, porta 5432 disponível.

```bash
cd /workspace/Escola
bash scripts/setup.sh
npm run dev
```

O setup instala o lockfile com `npm ci`, cria configuração local somente se ausente, inicia PostgreSQL 17 e aplica migrações versionadas em transação, com bloqueio e verificação de checksum. Nenhum segredo precisa ser enviado no chat. A configuração de banco local é exclusiva de desenvolvimento; não usar a senha local em produção.

Para criar demonstração, defina `DEMO_PASSWORD` de pelo menos 14 caracteres no arquivo ignorado `.env.local`, mantenha `DEMO_MODE=true` e execute:

```bash
node --env-file=.env.local --import tsx scripts/seed.ts
```

Nesta instância já há demonstração: `admin@nexo.example` e `diretor@nexo.example`. A senha foi gerada aleatoriamente e está somente no arquivo local ignorado `.env.local`. O seed não redefine contas existentes. A escola é explicitamente fictícia e começa sem indicadores de atividades inventados.

## Fluxo entregue

1. Entrar como administrador Certtifica.
2. Cadastrar instituição e unidade; selecionar instituição na carteira.
3. Iniciar a implantação com data configurável: cria 12 etapas ao longo de 60 dias.
4. Criar tarefas com responsável textual, prioridade e prazo.
5. Atualizar status; conclusão exige resultado da verificação.
6. Consultar indicadores calculados, agenda em lista, histórico e relatório operacional JSON.
7. Arquivar tarefas sem apagar o histórico. Diretor atribuído tem leitura; gestor atribuído pode operar.
8. Abrir **Usuários e acessos** como administrador para gerar convites, alterar papéis e revogar vínculos.
9. Usar **Esqueci minha senha** para validar recuperação local de demonstração. Veja [fluxos de acesso](docs/access.md).
10. Consultar **Central Certtifica** para a carteira consolidada e **Segurança da conta** para cadastrar MFA.
11. Personalizar permissões de tarefas, unidades, relatórios e auditoria na tela de acessos.

O vencimento é derivado do prazo e status, sem concluir tarefas automaticamente. Não há notificações agendadas nesta etapa. Os registros persistem no PostgreSQL. Atribuição nominal de tarefa ainda é textual, não um vínculo com usuário.

## Qualidade

Com PostgreSQL iniciado:

```bash
node --env-file=.env.local --import tsx --test tests/*.test.ts
npm run lint
npm run typecheck
npm run build
# Com npm run dev em outro terminal:
node --env-file=.env.local --import tsx scripts/smoke.ts
node --env-file=.env.local node_modules/@playwright/test/cli.js test
```

Playwright usa `/usr/bin/chromium`; configure `CHROMIUM_PATH` quando necessário. Os testes criam dados sintéticos e removem os próprios registros. Não executar contra banco de produção. Capturas locais ficam em `test-results/`, ignorado pelo Git. Veja [validação](docs/validation.md).

## Demonstração online

Configuração de hospedagem e publicação em [docs/online-demo.md](docs/online-demo.md). O site comercial na branch `nexo-site` é separado do sistema de gestão. Ainda não existe URL pública confirmada.

## Plano e evolução atual

O [plano mestre](PLANO_DESENVOLVIMENTO_NEXO.md) organiza as seis fases. O [incremento da Fase 1](docs/fundacao-fase1.md) registra a Central, as permissões e o MFA já implementados, os testes e o que ainda falta. Nenhuma publicação é realizada automaticamente.

## Documentação

- [Arquitetura, modelo e permissões](docs/architecture.md)
- [API e indicadores](docs/api.md)
- [Implantação, backups e configurações externas](docs/operations.md)
- [Escopo entregue e backlog](docs/backlog.md)

O desenvolvimento usa o checkout existente: cada tarefa na nuvem já é isolada; não criar worktrees sem solicitação explícita. Nada foi publicado em produção e nenhum merge foi executado.
