# API v0.1

Base `/api`, JSON, cookie `nexo_session`. Mutações exigem `Origin` igual à origem da aplicação. Respostas privadas não devem ser cacheadas. Erros: 400 entrada inválida, 401 sem sessão, 403 sem autorização, 404 rota ausente, 409 conflito/critério de conclusão, 413 corpo muito grande, 429 limite de login, 500 erro genérico.

| Método / rota                           | Entrada / resultado                                                                          |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| POST `/auth/login`                      | `{email,password}`; define cookie sem retornar token no JSON                                 |
| POST `/auth/logout`                     | Revoga sessão                                                                                |
| GET `/institutions`                     | Carteira autorizada                                                                          |
| POST `/institutions`                    | `{name,city?,state?}`; administrador global; retorna `{id}`                                  |
| GET `/institutions/:id`                 | Instituição, unidades, tarefas ativas, projeto, progresso, últimas 30 operações, `canManage` |
| POST `/institutions/:id/units`          | `{name}`                                                                                     |
| POST `/institutions/:id/onboarding`     | `{startsOn:"YYYY-MM-DD"}`; projeto único, cria 12 tarefas                                    |
| POST `/institutions/:id/tasks`          | `{title,description?,priority:"baixa"                                                        | "media" | "alta",dueOn:"YYYY-MM-DD",ownerName?}` |
| PATCH `/institutions/:id/tasks/:taskId` | `{status?,completionNote?,archive?}`; conclusão exige nota de verificação                    |
| GET `/institutions/:id/report`          | Relatório operacional JSON v1 com data e responsável; requer revisão humana                  |
| GET `/institutions/:id/care`            | Sempre 403; módulo indisponível                                                              |

Limites: nomes/títulos 2–160 caracteres, descrição e nota 2.000, responsável 120, cidade 100, UF até 2. Datas reais no formato ISO. Estados de tarefa: `pendente`, `em_andamento`, `em_validacao`, `concluida`. Reabertura e atualização de dados completos ainda precisam de fluxo de justificativa e edição.

## Indicadores

Todos usam tarefas da instituição ativa com `archived_at IS NULL`, atualizados após consultas e mutações. Não há comparação entre escolas. Período atual: todos os registros ativos; filtros por período ainda não disponíveis.

| Indicador         | Fórmula                                                             | Ausência de dados                         |
| ----------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| Ações em aberto   | Contagem com status diferente de concluída                          | 0                                         |
| Prazos em atenção | Abertas com data limite anterior ao dia atual UTC                   | 0                                         |
| Ações concluídas  | Contagem com status concluída                                       | 0                                         |
| Implantação       | Etapas concluídas / etapas ativas de implantação × 100, arredondado | Sem projeto: null, exibido como travessão |

Datas de prazo são datas civis, não instantes. A definição de dia nos indicadores usa UTC nesta versão; fuso por instituição é evolução necessária. Relatório JSON contém somente dados efetivamente cadastrados, inclusive auditoria e progresso. PDF, gráficos históricos e aprovação de publicação ainda não implementados.

## Gestão de contas

As rotas de convites, papéis e recuperação estão descritas em [Usuários e acessos](access.md). A entrega de recuperação é somente local em demonstração; envio real por e-mail permanece indisponível.
