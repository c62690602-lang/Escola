# Plano de desenvolvimento NEXO — CERTTIFICA

Referência funcional: [brief mestre fornecido pelo usuário](docs/BRIEF_MESTRE_NEXO.md).

## Objetivo e situação inicial

Plataforma operacional multiempresa para coordenar escolas, equipes e parceiros a distância, sem substituir validação humana técnica, clínica ou jurídica. Este plano incorpora o novo prompt mestre de 30 seções e preserva os requisitos anteriores compatíveis.

A branch `nexo-demo` já contém Next.js 16, React 19, TypeScript, Tailwind 4, PostgreSQL 17, Drizzle, validação Zod, sessões opacas, convites, recuperação local, vínculos institucionais, tarefas, implantação de 60 dias, auditoria e relatório JSON. O site comercial está separado na branch `nexo-site`; não será sobrescrito. O usuário já abriu o login da demonstração hospedada no Render, mas não forneceu sua URL: não há validação independente daquele deploy.

## Arquitetura

Monólito modular inicialmente: interface App Router → rotas HTTP → autenticação/autorização → serviços de domínio → Drizzle/PostgreSQL. Toda consulta institucional deve validar vínculo e instituição; identificadores imprevisíveis não substituem autorização. Auditoria e mutações de negócio são atômicas. Documentos e tarefas assíncronas serão adaptadores separados, sem dependência de funções efêmeras para trabalhos longos.

Três contextos: Central Certtifica (operação global autorizada), Portal Escola (escopo institucional) e futuro Portal de Parceiros (somente ordens de serviço atribuídas). Hierarquia futura: organização → rede → instituição → unidade → setor. A hierarquia não concede compartilhamento automaticamente.

## Banco de dados

Implementado: users, sessions, institutions, institution_units (units), memberships, onboarding_projects, tasks, account_tokens, audit_logs, login_attempts e schema_migrations. Migrações aplicadas nunca serão alteradas; novas mudanças terão arquivos numerados e checksums.

Nesta etapa: MFA cifrado por usuário, confirmação de segundo fator por sessão, recuperação MFA de uso único, permissões explícitas por vínculo e fuso IANA por instituição. As chaves de cifragem ficam fora do banco e do Git. O painel central agrega fontes existentes sem inventar indicadores de módulos ainda ausentes.

Planejado: organizations/networks/departments, diagnostics/answers/findings, legal_rules/applicability_assessments, employees/training_requirements, documents/versions/evidence, incidents/risks/actions, trainings/sessions/attendance, notifications/outbox/jobs/automation_runs, health_campaigns/wellbeing_activities, restricted_care_requests, partners/qualifications/service_orders, meetings/decisions/reports, accreditation/awards, contracts/subscriptions/financial_records e integrações. Cada registro pertinente terá institution_id, escopo, índices e FKs consistentes; arquivos privados não terão URLs públicas permanentes.

## Perfis e autorização

Papéis existentes serão preservados e complementados por permissões explícitas por vínculo institucional, validadas no servidor. Administração de acessos global e painel de comando não podem ser obtidos por um convite ou mudança de papel institucional. Sem vínculo, nenhuma permissão institucional. O módulo de acolhimento continua negado a todos até ter governança e segregação próprias.

A evolução por unidade/módulo só será ativada com testes que provem restrição por registro; não serão criados perfis que aparentem funcionar sem autorização correspondente.

## Fases e critérios de aceitação

| Fase                         | Escopo                                                                                                                     | Critério de conclusão                                                                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — Fundação funcional       | Banco, identidade, usuários, MFA privilegiado, instituições/unidades, permissões, Central e Portal Escola, auditoria       | Login real, MFA confirmado, escrita autorizada, isolamento entre duas escolas, estados vazios e painel com fontes reais; build/lint/testes aprovados |
| 2 — Gestão operacional       | Diagnóstico, matriz de obrigações, colaboradores, documentos, ocorrências, riscos, treinamentos, calendário e notificações | Diagnóstico aprovado gera plano rastreável; admissão consulta regras revisadas; evidências privadas e prazos corretos                                |
| 3 — Saúde e prevenção        | Psicossocial, bem-estar, Espaço Pausa, Prontidão/Lei Lucas, Ser Saúde, campanhas e comunicação com famílias                | Agregação com limiares; segregação de acolhimento; participação/evidências verificadas; divulgação aprovada pela escola                              |
| 4 — Inteligência e automação | Regras configuráveis, filas/jobs, tendências, relatórios, reuniões, IA e escalonamento                                     | Idempotência, retries, fontes explicáveis, decisões aprovadas geram tarefas, nenhuma decisão sensível automática                                     |
| 5 — Operação comercial       | Portal parceiros, qualificação, serviços, contratos, financeiro e acreditação                                              | Serviço solicitado/validado/aceito/executado/revisado; concessão formal; sem movimentar pagamentos sem autorização                                   |
| 6 — Consolidação e expansão  | Carga, segurança, recuperação, acessibilidade, governança de redes/municípios                                              | Testes e revisões documentados, restauração comprovada, escopo de compartilhamento explícito                                                         |

Testes de qualidade são executados em todas as fases; a Fase 6 amplia a cobertura, não adia segurança para o fim.

## Incremento atual da Fase 1

1. Formalizar este plano em commit próprio.
2. Acrescentar permissões institucionais configuráveis, fuso IANA e Painel de Comando Geral com agregações reais de instituições, unidades, tarefas e implantação. Manter desconhecidos os indicadores de colaboradores, treinamentos, contratos e receita que ainda não existem.
3. Implementar MFA TOTP com biblioteca mantida, segredo cifrado, confirmação do cadastro, proteção contra repetição, códigos de recuperação de uso único e revogação de sessões. A obrigatoriedade para administradores será ativada por configuração explícita, com tela de cadastro restrito para evitar bloqueio sem orientação.
4. Validar domínio, HTTP, navegador, acessibilidade, migrações e build. Registrar limitações e commits organizados. Não publicar ou executar merge nesta etapa.

## Dependências, integrações e validações externas

TOTP não exige serviço externo. Usará OTPAuth; QR será gerado localmente. MFA_ENCRYPTION_KEY exige segredo aleatório estável de pelo menos 32 caracteres, configurado no provedor antes de ativar MFA. Chaves nunca serão impressas nem incluídas em commits. A cifragem de disco/banco e backups depende da infraestrutura; não é garantida apenas pelo código.

E-mail transacional, armazenamento privado, filas, WhatsApp oficial, calendários, videoconferência, assinatura, pagamentos, fiscal e IA dependem de provedores/credenciais. Nenhuma integração será apresentada como ativa sem teste específico. Recuperação de senha ainda será local na máquina de desenvolvimento, indisponível na demonstração pública até configurar entrega real.

Responsáveis habilitados devem revisar aplicabilidade e versões normativas, instrumentos psicossociais, limiares de agregação, treinamentos práticos, critérios de certificados/acreditação, retenção e tratamentos de dados de menores. O sistema não declara conformidade legal automaticamente.

## Validação e entrega

Dados exclusivamente sintéticos, identificados como demonstração. Testes negativos de sessão expirada, segundo fator ausente/incorreto/repetido, códigos consumidos, privilégios insuficientes, tentativa entre instituições e estados sem dados. Migrações novas e repetidas devem passar. Testar formulários reais e persistência, não apenas renderização. Documentar fontes e período dos indicadores e distinguir funcionalidades concluídas, futuras e dependências externas.

Nenhum deploy de produção está autorizado por este prompt. A demonstração existente não será alterada automaticamente. Ao concluir o incremento, apresentar funcionalidades, arquivos, migrações, rotas, resultados, pendências, comandos e próximas prioridades. A fundação não equivale ao produto completo nem à liberação comercial.

## Estado deste incremento

Central, permissões institucionais, fuso e MFA implementados e validados. São 35 testes de integração, quatro fluxos de navegador e um fluxo HTTP local de produção com MFA obrigatório, além de build/lint/TypeScript e migrações. O setup repetido preservou a chave MFA existente. O detalhamento e as pendências estão em [docs/fundacao-fase1.md](docs/fundacao-fase1.md). A Fase 1 completa ainda tem itens pendentes; nenhuma atualização da demonstração foi executada.
