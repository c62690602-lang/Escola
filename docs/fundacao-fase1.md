# Incremento funcional da Fase 1

## Implementado

- Painel `/central`, exclusivo da administração: instituições, unidades ativas, tarefas em aberto/atrasadas, prioridades altas e implantação. Fontes reais, campos ausentes identificados como indisponíveis, links para cada instituição.
- Permissões por vínculo: `tasks.write`, `units.write`, `reports.read`, `audit.read`. Null aplica o padrão do papel; lista vazia remove essas permissões. O servidor verifica cada operação, não apenas menus. Alterações revogam sessões.
- Fuso IANA no cadastro institucional. Atrasos do portal e da Central usam a data civil nesse fuso. Período dos indicadores: todos os registros ativos; tarefas arquivadas são excluídas.
- MFA em `/seguranca`: TOTP via OTPAuth, QR PNG gerado localmente, confirmação de código, segredo cifrado com AES-256-GCM e vínculo criptográfico ao usuário, janela de tempo limitada e bloqueio de repetição.
- Dez códigos de recuperação por cadastro, mostrados uma vez, armazenados somente como hashes e consumidos atomicamente. Recuperar a senha não remove o MFA.
- `REQUIRE_ADMIN_MFA=true`: senha correta gera sessão restrita à configuração de MFA, status e logout. Rotas operacionais ficam bloqueadas até confirmar o segundo fator. Administradores não podem desativá-lo enquanto obrigatório.
- Usuários não administrativos podem ativar MFA opcional. Desativação exige senha atual e segundo fator; encerra todas as sessões. MFA de contas existentes continua exigido mesmo se a configuração de obrigatoriedade for desligada.

## Arquivos e modelo

| Área           | Arquivos                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Plano          | `PLANO_DESENVOLVIMENTO_NEXO.md`                                                                                     |
| Persistência   | `migrations/003_foundation_controls.sql`, `src/lib/schema.ts`                                                       |
| Autorização    | `src/lib/permissions.ts`, `src/lib/service.ts`, `src/lib/access.ts`                                                 |
| Identidade/MFA | `src/lib/auth.ts`, `src/lib/mfa.ts`, `src/lib/mfa-crypto.ts`                                                        |
| Interface      | `src/app/central`, `src/app/seguranca`, `src/components/security-panel.tsx`, telas de acessos e portal              |
| Validação      | `tests/controls.test.ts`, `tests/mfa.test.ts`, `tests/browser/foundation.spec.ts`, `tests/production/foundation.ts` |

A migração 003 adiciona `institutions.timezone`, `memberships.permissions`, `sessions.mfa_verified/setup_only` e `mfa_credentials`. Esta última contém segredo cifrado, cadastro pendente com expiração, contador TOTP consumido e hashes de recuperação. Nenhum segredo é incluído em relatórios ou auditoria. Eventos de ativação/desativação são auditados. Migrações 001 e 002 permanecem intactas.

## API acrescentada

| Método / rota                                 | Uso                                                                                                 |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| GET `/api/central`                            | Agregações globais autorizadas                                                                      |
| GET `/api/auth/security`                      | Estado MFA, obrigatoriedade, quantidade de códigos e configuração disponível; sem segredos          |
| POST `/api/auth/mfa/setup`                    | `{password}`; exige senha atual, devolve QR/chave somente para cadastrar autenticador               |
| POST `/api/auth/mfa/confirm`                  | `{code}`; ativa MFA e devolve códigos de recuperação uma única vez                                  |
| POST `/api/auth/mfa/disable`                  | `{password,code}`; proibido para administrador quando obrigatório                                   |
| POST `/api/auth/login`                        | Aceita `code` opcional; 401 com `mfaRequired:true` quando necessário, sem emitir sessão operacional |
| PATCH `/api/institutions/:id/members/:userId` | Acrescenta `{permissions:[...]}` ou `{permissions:null}`                                            |

Cadastro do autenticador expira em 10 minutos. TOTP usa SHA-1/6 dígitos/30 segundos (compatível com aplicativos comuns), tolerância de um intervalo, contador estritamente crescente. Operações de cadastro e desativação têm limite de 10 tentativas por usuário em 15 minutos; login mantém seu limite por conta. Limitação de IP no gateway e proteção contra ataques distribuídos seguem pendentes.

## Execução e configuração

```bash
cd /workspace/Escola
bash scripts/setup.sh
npm run dev
# Em outro terminal:
npm test
npm run test:e2e
npm run test:smoke
npm run lint
npm run typecheck
npm run build
```

O setup cria `MFA_ENCRYPTION_KEY` local aleatória, se não existir, sem imprimir o valor e sem substituir a chave existente. No provedor de hospedagem, configurar uma chave real aleatória estável com pelo menos 32 caracteres. Depois ativar `REQUIRE_ADMIN_MFA=true`. O `render.yaml` atualizado propõe as variáveis para futura revisão, mas não atualiza a demonstração automaticamente.

A chave deve ser preservada em cofre e junto do procedimento de recuperação, separadamente do dump do banco. Não substituí-la a cada deploy. Ainda não existe rotina automatizada de rotação/recifragem ou desbloqueio de identidade quando todos os fatores forem perdidos; esses casos exigem procedimento administrativo verificado. Nunca criar um bypass de MFA baseado apenas em recuperação de senha.

O teste `tests/production/foundation.ts` só aceita servidor local e dados sintéticos. Executar contra um build iniciado com MFA obrigatório, apontando `PRODUCTION_TEST_URL` e `PRODUCTION_TEST_ORIGIN` e usando o banco isolado de testes. Não executar contra a demonstração pública ou uma conta real.

## Evidência e limites

35 testes de integração e 4 fluxos Playwright aprovados; auditoria axe nas telas verificadas; smoke HTTP; build, lint e TypeScript. O teste local do build de produção confirmou o fluxo administrativo obrigatório completo, sem publicar a aplicação. Ver `docs/validation.md`.

Este incremento amplia uma fundação utilizável; não encerra todo o escopo da Fase 1. Ainda faltam identidade/SSO gerenciada, entrega real de recuperação por e-mail, escopos por unidade, novos perfis/módulos, gestão completa de edição/arquivamento, retenção e revisão de segurança. MFA obrigatório nesta implementação é configurável para administradores globais; demais perfis podem ativá-lo opcionalmente. Políticas específicas para outros papéis privilegiados são evolução necessária.

A Fase 2 — diagnóstico, aplicabilidade, colaboradores, documentos, ocorrências e treinamentos — ainda não foi implementada. Integrações, pagamentos, IA, normas e reconhecimento institucional não foram simulados como funcionalidades concluídas. Nenhum deploy ou merge foi realizado nesta etapa.
