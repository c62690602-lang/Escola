# Entrega e sequência de implementação

## Entregue e executável

Next.js/TypeScript/Tailwind, PostgreSQL/Drizzle, migração, login/logout, hash de senha, sessão expirada no servidor, papéis fixos, autorização por vínculo, carteira, cadastro de instituição/unidade, seleção de instituição, dashboard com estados vazios, implantação de 60 dias e 12 etapas, tarefas e status com conclusão verificada, arquivamento, agenda em lista, auditoria e relatório JSON. Demonstração explicitamente fictícia. Testes de serviço, HTTP, navegador e acessibilidade essenciais.

O plano mestre atual está em [PLANO_DESENVOLVIMENTO_NEXO.md](../PLANO_DESENVOLVIMENTO_NEXO.md). Foram acrescentados Central Certtifica, fuso institucional, permissões por vínculo e MFA TOTP com recuperação de uso único. A Fase 1 está **parcialmente concluída** e há um recorte utilizável da Fase 2. Não existe implementação silenciosa dos demais módulos.

## Próxima etapa — fechar a fundação

- Provedor de identidade/SSO maduro e entrega real por e-mail. MFA TOTP administrativo foi implementado e precisa ser ativado com chave estável no ambiente de destino. Convites e recuperação local de demonstração implementados.
- Escopos por unidade e novos módulos. Permissões configuráveis de tarefas, unidades, relatórios e auditoria já implementadas por vínculo. Gestão de vínculos, alteração de papéis fixos e revogação já disponíveis na interface.
- Edição de instituições/unidades e dados de tarefa, justificativa de reabertura e aprovação por outro usuário quando exigida.
- CI automatizado. Migrações incrementais com tabela de versões, lock e checksum implementadas.
- Testes de provisionamento, escalada de papel, carga e segurança ampliados.
- Política de retenção/eliminação, solicitações de titulares e exportações auditadas.

## Fase 2 — operação central restante

Diagnóstico e matriz de aplicabilidade com revisão técnica; colaboradores e regras de integração/treinamento; documentos privados, upload seguro e versões; riscos e medidas; notificações e jobs idempotentes; calendário mensal e filtros; responsáveis vinculados; evidências e critérios de aprovação.

## Fase 3 — módulos de programa

Psicossocial com supressão de grupos pequenos e validação técnica, treinamentos/Prontidão com presença e evidências, Ser Saúde, bem-estar, experiências e cuidado individual mínimo com segregação adicional. Nenhum destes módulos está habilitado.

## Fase 4 — inteligência de gestão

Reuniões mensais e decisões para o ciclo seguinte, indicadores históricos com fontes e períodos, PDF versionado, revisão/aprovação, acreditação por responsável autorizado e verificação pública restrita. Atual relatório JSON não substitui estes requisitos.

## Fase 5 — produto comercial

Contratos, assinaturas, ativação de módulos, suporte, integrações autorizadas, preparação e revisão de produção. Não há cobrança automática ou pagamentos reais.

## Fase 6 — consolidação e expansão

Organizações mantenedoras, redes, observatório agregado e municípios com governança de dados. Não compartilhar dados automaticamente.

## Critérios do pedido original

Cenários 1, 2, 11 e 13 têm cobertura nesta entrega. Cenário 12 é negado por indisponibilidade total do módulo, sem implementar o serviço de cuidado. Cenário 9 tem somente relatório JSON, ainda sem PDF/aprovação. Cenários 3–8 e 10 exigem os módulos futuros. Estes números se referem aos critérios do briefing anterior. O novo prompt mestre de 30 seções está incorporado ao plano; nenhum dos briefings está integralmente entregue.
