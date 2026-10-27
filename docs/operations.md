# Operação de desenvolvimento e preparação para produção

## Configuração

`.env.example` lista as variáveis. Next lê `.env.local`; comandos CLI precisam de `node --env-file=.env.local --import tsx ...`. Configuração local é ignorada pelo Git e criada com permissão restrita. Nunca versionar arquivos de ambiente ou backups.

- DATABASE_URL: conexão privada PostgreSQL.
- DEMO_MODE: banner e autorização do seed; não usar seed em produção.
- DEMO_PASSWORD: somente criação inicial de usuários fictícios; escolher valor forte, não compartilhar em chat.
- APP_ORIGIN: origem HTTPS exata de implantação, necessária atrás de reverse proxy.
- CHROMIUM_PATH: caminho opcional de navegador para testes.

O setup não instala VPN, não substitui autenticação Git e não requer serviços externos de e-mail, IA ou pagamento. npm usa os registries permitidos; imagem Postgres tem digest fixo. TLS e verificações de integridade permanecem habilitados.

## Processos e persistência

Iniciar `bash scripts/setup.sh`, depois `npm run dev`. O setup usa o container local `nexo-postgres` e não o remove. Em instalações novas usa volume nomeado do Compose; a instância inicial usa volume Docker persistente. Processos precisam ser reiniciados em tarefas futuras. Dados do banco não devem depender apenas da sobrevivência de volumes Docker em snapshots: gerar backup em arquivo antes de publicar.

```bash
bash scripts/backup.sh
```

Cria `.local/nexo.dump` com pg_dump em formato custom e permissão restrita. Setup restaura esse arquivo **somente quando cria um container novo**, nunca por cima de um banco existente. Atualize backup após alterações relevantes. Se houver container existente vazio ou quebrado, investigar manualmente; não apagar dados automaticamente.

Teste de recuperação (usar banco novo e removível):

```bash
docker exec nexo-postgres createdb -U nexo nexo_restore_check
docker exec -i nexo-postgres pg_restore -U nexo -d nexo_restore_check --no-owner --exit-on-error < .local/nexo.dump
docker exec nexo-postgres psql -U nexo -d nexo_restore_check -c 'SELECT count(*) FROM institutions'
docker exec nexo-postgres dropdb -U nexo nexo_restore_check
```

Na execução inicial, backup restaurado com 2 usuários fictícios e 1 instituição fictícia. Isto valida pg_dump/pg_restore, não recuperação de desastre da infraestrutura nem restauração em nova tarefa.

## Provisionamento local de usuário

Além dos convites pela interface, operador pode criar usuário não administrador com `scripts/provision-user.ts`. Definir `USER_NAME`, `USER_EMAIL`, `USER_PASSWORD`, `INSTITUTION_ID`, `USER_ROLE` por arquivo local seguro ou mecanismo de segredos; não passar senha por argumento de linha de comando nem registrar no histórico. Executar `node --env-file=<arquivo-seguro> --import tsx scripts/provision-user.ts`. Requer DATABASE_URL e uma instituição existente. Papéis válidos documentados na arquitetura. Há recuperação local de demonstração em /recuperar, com mensagens privadas em .local/mail; envio externo não configurado. Ver docs/access.md.

## Produção ainda pendente

Usar PostgreSQL gerenciado com usuário de aplicação limitado, TLS verificável, segredos fortes e acesso privado. Configurar domínio HTTPS e APP_ORIGIN, identidade/MFA, e-mail transacional, política de sessão, observabilidade sem dados sensíveis, backup cifrado com retenção e testes de restauração. Implementar armazenamento privado antes de aceitar documentos. Validar retenção, consentimentos e bases de tratamento com responsáveis jurídicos e operacionais. Rodar testes de carga, acessibilidade e revisão independente de segurança; preparar CI e deploy. Rodar `npm run build` e `npm start` sob supervisor após estes pré-requisitos. Nunca publicar com contas ou credenciais locais de demonstração.

A configuração salva no onboarding é rascunho. Revisar e salvar nas configurações do ambiente, depois publicar pelo produto. Não foi feito deploy da aplicação em produção.
