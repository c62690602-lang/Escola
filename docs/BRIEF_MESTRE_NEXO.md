# PROMPT MESTRE PARA O CODEX

# DESENVOLVIMENTO DO SISTEMA NEXO

## CERTTIFICA APRESENTA NEXO

**Inteligência que conecta. Gestão que transforma.**

## 1. OBJETIVO DO PROJETO

Desenvolva uma plataforma SaaS de gestão inteligente, moderna, responsiva, segura, multiempresa e altamente automatizada, denominada **NEXO**, inicialmente destinada a instituições de ensino.

O sistema pertence à CERTTIFICA, integrante do Grupo D’Aguiar Consultoria em TI.

O NEXO deverá integrar, em uma única plataforma:

- Gestão de riscos e segurança institucional.
- Saúde e segurança do trabalho.
- Gestão de fatores de riscos psicossociais relacionados ao trabalho.
- Promoção da saúde e prevenção.
- Saúde emocional e bem-estar dos profissionais.
- Prontidão para emergências e primeiros socorros.
- Gestão e controle de treinamentos.
- Documentos, protocolos e evidências.
- Comunicação institucional e com famílias.
- Gestão de ocorrências e planos de ação.
- Indicadores e inteligência de dados.
- Automação operacional e administrativa.
- Acompanhamento estratégico remoto.
- Gestão comercial, contratos e parceiros.
- Preparação para acreditação institucional.

**OBJETIVO CENTRAL:** Permitir que a CERTTIFICA administre dezenas ou centenas de instituições sem precisar estar fisicamente em cada escola.

O sistema deverá reduzir tarefas repetitivas, identificar pendências automaticamente, gerar relatórios e orientar decisões, mantendo validação humana nos processos técnicos, legais e sensíveis.

Não desenvolver apenas uma apresentação visual ou protótipo estático. Criar uma aplicação funcional, com banco de dados, autenticação, permissões, regras de negócio, interfaces e documentação.

---

## 2. ARQUITETURA DO SISTEMA

A plataforma deverá funcionar com três ambientes integrados.

### AMBIENTE 1 — CENTRAL CERTTIFICA

Painel administrativo central para gerenciamento de todas as escolas contratantes.

Funcionalidades:

- Cadastrar instituições.
- Visualizar todas as unidades atendidas.
- Gerenciar contratos e planos contratados.
- Acompanhar indicadores por escola.
- Identificar instituições com pendências críticas.
- Monitorar implantação e cumprimento dos planos de ação.
- Acompanhar treinamentos obrigatórios.
- Visualizar documentos próximos do vencimento.
- Gerenciar demandas técnicas.
- Distribuir atividades para profissionais parceiros.
- Monitorar custos e receitas dos contratos.
- Gerar relatórios executivos individuais e consolidados.
- Agendar reuniões estratégicas.
- Controlar entregas mensais.
- Comparar indicadores entre instituições respeitando a confidencialidade.
- Gerenciar usuários e permissões.

Criar um **Painel de Comando Geral** para que a direção consiga compreender o desempenho de toda a operação em poucos minutos.

### AMBIENTE 2 — PORTAL DA ESCOLA

Cada escola deverá ter seu ambiente privado, personalizado com seu nome, unidades, colaboradores e dados próprios.

Funcionalidades:

- Painel executivo.
- Diagnóstico institucional.
- Obrigações aplicáveis.
- Documentos e protocolos.
- Treinamentos e certificações.
- Gestão de riscos.
- Ocorrências e medidas corretivas.
- Saúde e bem-estar.
- Calendário institucional.
- Planos de ação.
- Indicadores e relatórios.
- Comunicação com a CERTTIFICA.
- Solicitações técnicas e de treinamentos.

O diretor deverá ter uma visão estratégica, enquanto os profissionais terão acesso apenas às funcionalidades necessárias ao seu trabalho.

### AMBIENTE 3 — PORTAL DE PROFISSIONAIS E PARCEIROS

Ambiente destinado aos profissionais credenciados e prestadores de serviços.

Exemplos:

- Enfermeiros.
- Instrutores de primeiros socorros.
- Técnicos de segurança.
- Engenheiros de segurança.
- Médicos do trabalho.
- Psicólogos.
- Profissionais de promoção da saúde.
- Consultores.
- Facilitadores de atividades e experiências.

Funcionalidades:

- Cadastro e validação profissional.
- Especialidades e regiões atendidas.
- Agenda e disponibilidade.
- Recebimento de solicitações.
- Aceite de serviços.
- Registro de execução.
- Upload de evidências.
- Emissão ou anexação de documentos, quando habilitados.
- Controle de pagamento.
- Avaliação de qualidade.
- Histórico de serviços prestados.

A escola solicita uma atividade presencial, a CERTTIFICA acompanha e um parceiro habilitado realiza a execução.

---

## 3. MÓDULO DE DIAGNÓSTICO INTELIGENTE

Criar um diagnóstico inicial digital para cada instituição.

A escola deverá responder a um formulário estruturado sobre:

- Natureza da instituição.
- Número de unidades.
- Quantidade de funcionários.
- Número de alunos.
- Etapas de ensino.
- Infraestrutura.
- Organização administrativa.
- Treinamentos existentes.
- Procedimentos de emergência.
- Documentação de saúde e segurança.
- Condições de trabalho.
- Gestão de riscos.
- Ações de promoção da saúde.
- Práticas de bem-estar.
- Protocolos e comunicação com famílias.

Após as respostas, o sistema deverá:

1. Identificar lacunas documentais e operacionais.
2. Sugerir obrigações potencialmente aplicáveis.
3. Classificar prioridades.
4. Criar um plano inicial de implantação.
5. Solicitar documentos e evidências necessários.
6. Gerar cronograma com responsáveis e prazos.
7. Disponibilizar um relatório diagnóstico.
8. Registrar o que depende de avaliação de profissional habilitado.

A classificação automática será uma triagem preliminar, não uma declaração de conformidade legal.

---

## 4. MÓDULO DE OBRIGAÇÕES LEGAIS E CONFORMIDADE

Criar um motor de obrigações baseado em regras configuráveis.

O sistema deverá considerar, conforme a aplicabilidade:

- Lei Federal nº 13.722/2018 — Lei Lucas.
- NR-1 — disposições gerais e gerenciamento de riscos ocupacionais.
- Gerenciamento de Riscos Ocupacionais — GRO.
- Programa de Gerenciamento de Riscos — PGR, quando exigível.
- NR-7 — PCMSO, quando aplicável.
- Outras Normas Regulamentadoras pertinentes.
- Fatores de riscos psicossociais relacionados ao trabalho.
- Legislação de prevenção e primeiros socorros.
- Regras estaduais e municipais pertinentes.
- Normas sanitárias e de segurança aplicáveis.
- Exigências educacionais pertinentes.
- Lei Geral de Proteção de Dados — LGPD.

A plataforma NÃO poderá considerar todas as obrigações iguais para todas as escolas.

Criar uma **Matriz de Aplicabilidade Legal**, considerando tipo de instituição, localização, número de trabalhadores, natureza das atividades, riscos e demais critérios necessários.

Para cada obrigação, registrar:

- Identificação e fundamento normativo.
- Escopo e critérios de aplicabilidade.
- Versão e vigência da referência normativa.
- Responsável técnico ou administrativo.
- Prazo.
- Evidência necessária.
- Status.
- Próxima revisão.
- Histórico de alterações.

Status possíveis:

- Não avaliado.
- Não aplicável, com justificativa.
- Pendente.
- Em andamento.
- Aguardando evidência.
- Aguardando validação técnica.
- Validado.
- Vencido.

As regras deverão ser revisáveis e aprovadas por responsável habilitado.

O sistema poderá orientar, organizar e monitorar, mas **não deverá emitir parecer técnico, atestado legal ou certificado de conformidade automaticamente**.

---

## 5. MÓDULO PSICOSSOCIAL — NEXO

Desenvolver um módulo de gestão preventiva dos fatores de riscos psicossociais relacionados à organização do trabalho.

Recursos:

- Questionários institucionais configuráveis.
- Diagnósticos organizacionais.
- Registro de fatores de risco identificados.
- Avaliação de condições e organização do trabalho.
- Indicadores agregados.
- Comparação histórica.
- Plano de prevenção e melhoria.
- Acompanhamento de ações.
- Registro de evidências.
- Relatórios de evolução.
- Alertas de fatores que exigem atenção.
- Encaminhamento para avaliação especializada quando necessário.

O sistema deverá proteger o anonimato de respostas quando o instrumento utilizado exigir confidencialidade, inclusive restringindo resultados de grupos pequenos.

Separar claramente **riscos psicossociais ocupacionais**, **bem-estar organizacional** e **acolhimento individual**.

A identificação automatizada não poderá substituir análise técnica, diagnóstico clínico ou avaliação profissional.

---

## 6. MÓDULO DE SAÚDE EMOCIONAL E BEM-ESTAR

Criar um ambiente dedicado à valorização, ao bem-estar e ao desenvolvimento saudável dos profissionais.

Funcionalidades:

- Pesquisas de percepção do ambiente de trabalho.
- Indicadores agregados de bem-estar.
- Ações preventivas e educativas.
- Calendário de campanhas.
- Atividades de integração.
- Registro de participação.
- Pesquisa de satisfação.
- Avaliação de impacto das ações.
- Acompanhamento de melhorias organizacionais.

### Espaço Pausa NEXO

Criar uma seção destinada a experiências de bem-estar e recuperação.

Atividades possíveis:

- Quick massage.
- Massoterapia.
- Educação postural.
- Pausas orientadas.
- Experiências de relaxamento.
- Atividades de promoção da saúde.
- Valorização e reconhecimento profissional.

O sistema deverá permitir que a escola solicite uma experiência e que a CERTTIFICA encaminhe sua execução a profissionais parceiros.

### Acolhimento restrito

Criar uma funcionalidade separada para solicitação de acolhimento, orientações ou encaminhamento.

Informações sensíveis não deverão ficar visíveis para diretores escolares, gestores de recursos humanos ou outros usuários sem autorização e necessidade legítima de acesso.

Não transformar esse módulo em prontuário clínico ou serviço de psicoterapia.

---

## 7. MÓDULO DE PRONTIDÃO — LEI LUCAS

Criar uma gestão permanente de capacitação e preparação institucional em primeiros socorros.

Funcionalidades:

- Cadastro de profissionais.
- Identificação de público a ser capacitado.
- Histórico de treinamentos.
- Controle de participação.
- Controle de certificados e evidências.
- Planejamento de capacitações.
- Simulados.
- Protocolos para intercorrências.
- Fluxos de acionamento.
- Registro institucional de emergências.
- Verificação de materiais e recursos.
- Indicadores de prontidão.
- Alertas de reciclagem, conforme requisitos aplicáveis.

O sistema deverá identificar novos funcionários e verificar se há necessidade de incluí-los em treinamentos.

Quando houver uma pendência:

1. Criar solicitação.
2. Notificar responsável.
3. Oferecer datas e modalidades disponíveis.
4. Encaminhar ao profissional credenciado.
5. Registrar execução.
6. Receber evidências.
7. Encaminhar para validação.
8. Atualizar o histórico da instituição.

Treinamentos presenciais deverão ser conduzidos por profissionais habilitados conforme os requisitos aplicáveis.

A plataforma não deve presumir que conteúdo on-line substitui capacitação prática legalmente exigida.

---

## 8. MÓDULO SER SAÚDE NA ESCOLA

Desenvolver uma área para promoção da saúde e educação preventiva.

Funcionalidades:

- Planejamento anual de campanhas.
- Calendário de educação em saúde.
- Materiais educativos.
- Controle das atividades realizadas.
- Ações para profissionais.
- Ações para alunos, conforme autorização e faixa etária.
- Atividades destinadas às famílias.
- Registro de alcance das campanhas.
- Avaliação de participação e resultados.

Temas possíveis:

- Primeiros socorros.
- Prevenção de acidentes.
- Hábitos saudáveis.
- Saúde infantil.
- Higiene.
- Sono.
- Alimentação.
- Saúde emocional.
- Educação postural.
- Prevenção de doenças.
- Temas sazonais.

Criar uma biblioteca de campanhas reutilizáveis e personalizáveis.

Cada escola poderá selecionar ações e solicitar sua execução remota ou presencial.

---

## 9. MÓDULO DE GESTÃO DE RISCOS, DOCUMENTOS E PROTOCOLOS

Criar um repositório institucional estruturado.

Categorias:

- Documentos de saúde e segurança.
- Documentos de gerenciamento de riscos.
- Protocolos de emergência.
- Procedimentos Operacionais Padrão — POPs.
- Planos de ação.
- Relatórios.
- Certificados.
- Registros de treinamento.
- Registros de inspeções.
- Evidências de execução.
- Documentos institucionais.

Funcionalidades:

- Upload de arquivos.
- Versionamento.
- Assinatura eletrônica por integração, quando necessário.
- Aprovação.
- Controle de vigência.
- Histórico de revisão.
- Responsável pelo documento.
- Alertas de vencimento.
- Solicitação automática de atualização.
- Controle de acesso.
- Registro de auditoria.

Incluir biblioteca de modelos editáveis para procedimentos e protocolos.

Modelos devem ser tratados como documentos-base, sujeitos à personalização e validação técnica.

---

## 10. MÓDULO DE GESTÃO DE COLABORADORES

Cada escola deverá manter uma base atualizada de seus profissionais.

Dados:

- Identificação funcional.
- Cargo.
- Setor.
- Unidade.
- Data de admissão.
- Vínculo e situação funcional.
- Treinamentos necessários.
- Treinamentos realizados.
- Pendências administrativas.
- Documentos e certificações aplicáveis.

Criar integração por arquivo ou API com sistemas de RH.

### Automação na admissão

Quando um novo colaborador for cadastrado, o sistema deverá:

1. Identificar cargo, função e unidade.
2. Consultar a matriz de treinamentos aplicáveis.
3. Verificar as necessidades de capacitação.
4. Criar tarefas pendentes.
5. Notificar os responsáveis.
6. Incluir a pessoa nas próximas turmas.
7. Monitorar evidências e conclusão.

Criar fluxo equivalente para mudança de função, transferência e desligamento.

Evitar coleta de dados pessoais desnecessários.

---

## 11. MÓDULO DE OCORRÊNCIAS E PLANOS DE AÇÃO

Criar registros específicos para:

- Acidentes.
- Incidentes.
- Quase acidentes.
- Situações de risco.
- Falhas operacionais.
- Não conformidades.
- Demandas de prevenção.
- Outras ocorrências institucionais.

Cada ocorrência deverá ter:

- Identificação e data.
- Unidade.
- Categoria.
- Descrição.
- Classificação preliminar.
- Responsáveis.
- Medidas imediatas.
- Encaminhamentos.
- Plano de ação.
- Prazos.
- Evidências.
- Revisões e encerramento.

O sistema deverá automatizar notificações, prazos e acompanhamento.

Criar orientações para acionamento humano imediato diante de situações urgentes.

Não usar classificações automatizadas para decisões clínicas ou investigação conclusiva de responsabilidade.

---

## 12. MÓDULO DE TREINAMENTOS E CAPACITAÇÕES

Criar uma plataforma de gestão de aprendizagem integrada.

Recursos:

- Catálogo de treinamentos.
- Trilhas por função.
- Cursos e materiais digitais.
- Inscrições.
- Calendário de turmas.
- Controle de presença.
- Avaliações de aprendizagem.
- Emissão de certificados quando apropriado.
- Registro de instrutor.
- Carga horária.
- Evidências de atividades práticas.
- Histórico individual.
- Alertas de atualização.
- Relatórios de participação.

Separar treinamentos educativos livres daqueles sujeitos a critérios legais específicos.

Somente emitir certificados com os campos, aprovações e requisitos apropriados.

---

## 13. MÓDULO DE COMUNICAÇÃO COM AS FAMÍLIAS

Criar uma funcionalidade controlada pela instituição para divulgar ações educativas e preventivas.

Funcionalidades:

- Calendário de campanhas.
- Convites para atividades.
- Conteúdos educativos.
- Comunicados institucionais.
- Inscrições para eventos.
- Pesquisas de satisfação.
- Indicadores agregados de participação.

A escola deverá aprovar os conteúdos antes de sua divulgação.

Não criar acesso indiscriminado das famílias a dados de trabalhadores, alunos ou registros internos.

---

## 14. CENTRAL DE INTELIGÊNCIA NEXO

Criar um sistema inteligente de cruzamento de informações.

A Central deverá reunir dados sobre:

- Obrigações e conformidade.
- Riscos.
- Fatores psicossociais.
- Treinamentos.
- Prontidão.
- Documentos.
- Colaboradores.
- Saúde e bem-estar.
- Campanhas.
- Planos de ação.
- Ocorrências.
- Resultados.
- Indicadores de melhoria.

### Automações inteligentes

Exemplos:

**Situação 1:** Um treinamento apresenta pendência.

O NEXO identifica a lacuna, notifica a escola, sugere encaminhamento e acompanha a execução.

**Situação 2:** Um documento está próximo do vencimento.

O sistema notifica o responsável, abre uma tarefa e acompanha a atualização.

**Situação 3:** Uma escola apresenta repetição de incidentes.

O sistema identifica a tendência, sinaliza atenção e sugere uma análise técnica.

**Situação 4:** Uma ação de bem-estar teve baixa participação.

O sistema informa o resultado e sugere revisão de formato, comunicação ou programação.

**Situação 5:** Uma escola apresenta atraso recorrente nos planos de ação.

O sistema comunica a gestão e inclui a pendência na pauta da próxima reunião estratégica.

### Assistente de inteligência artificial

Criar arquitetura para um assistente de IA que possa:

- Consultar documentos autorizados.
- Resumir indicadores.
- Explicar funcionalidades.
- Elaborar minutas de relatórios.
- Sugerir planos de ação.
- Identificar pendências.
- Organizar pautas de reuniões.
- Redigir comunicações institucionais.
- Propor campanhas educativas.

A IA deverá respeitar permissões, registrar fontes dos dados utilizados, sinalizar incertezas e exigir aprovação humana para comunicações, alterações relevantes e documentos oficiais.

Nunca enviar dados pessoais sensíveis a serviços externos sem controles e base legal adequados.

---

## 15. PAINÉIS DE INDICADORES

Criar dashboards visuais, modernos e interativos.

### Painel da CERTTIFICA

Indicadores:

- Total de escolas atendidas.
- Total de unidades.
- Funcionários abrangidos.
- Situação das implantações.
- Pendências críticas.
- Treinamentos programados.
- Treinamentos concluídos.
- Documentos vencidos.
- Planos de ação atrasados.
- Solicitações de parceiros.
- Reuniões do mês.
- Contratos ativos.
- Receita recorrente.
- Entregas pendentes.

### Painel executivo da escola

Indicadores:

- Evolução do diagnóstico.
- Situação das obrigações aplicáveis.
- Percentual de capacitações concluídas.
- Indicadores de prontidão.
- Planos de ação.
- Saúde e bem-estar.
- Participação em campanhas.
- Evolução do programa psicossocial.
- Documentação.
- Próximas prioridades.

Criar gráficos históricos e filtros por período, unidade e categoria.

Sempre permitir acesso ao dado de origem e distinguir dados confirmados de estimativas.

---

## 16. IMPLANTAÇÃO INTELIGENTE EM 60 DIAS

Criar um fluxo padrão de implantação em 60 dias, ajustável às necessidades da instituição.

**Etapa 1 — Conhecimento da instituição**

Cadastro, diagnóstico inicial, levantamento de necessidades e documentos.

**Etapa 2 — Estruturação**

Organização da base, análise das obrigações, identificação de riscos e elaboração das prioridades.

**Etapa 3 — Implementação**

Criação de fluxos, protocolos, planos de ação e programação de treinamentos.

**Etapa 4 — Consolidação**

Validação de evidências, acompanhamento dos indicadores e preparação do funcionamento contínuo.

O sistema deverá permitir:

- Checklists.
- Cronograma.
- Responsáveis.
- Notificações.
- Percentual de evolução.
- Identificação de atrasos.
- Reagendamento.
- Relatório de conclusão.

Após a implantação, iniciar automaticamente o ciclo de acompanhamento mensal.

---

## 17. ACOMPANHAMENTO ESTRATÉGICO MENSAL

Este módulo é essencial para permitir à CERTTIFICA trabalhar integralmente a distância.

O sistema deverá:

1. Acompanhar os indicadores continuamente.
2. Identificar tendências e pendências relevantes.
3. Preparar um relatório mensal preliminar.
4. Sugerir pautas para a reunião estratégica.
5. Enviar lembretes de agendamento.
6. Integrar-se com plataforma de videoconferência.
7. Permitir registro de decisões.
8. Transformar decisões aprovadas em tarefas.
9. Definir responsáveis e prazos.
10. Monitorar entregas para o mês seguinte.

O relatório mensal deverá ser editável e validado antes de sua divulgação.

Criar histórico de todas as reuniões e decisões.

---

## 18. ACREDITAÇÃO NEXO

Criar um módulo de reconhecimento institucional por evolução e maturidade da gestão.

Prever três níveis configuráveis de acreditação.

Os nomes definitivos dos níveis serão definidos pela CERTTIFICA.

Avaliar critérios como:

- Estrutura de gestão.
- Capacitações.
- Qualidade documental.
- Processos implementados.
- Evidências.
- Gestão preventiva.
- Monitoramento de indicadores.
- Evolução dos planos de ação.
- Saúde e bem-estar.
- Melhoria contínua.

O NEXO poderá calcular a pontuação preliminar e mostrar o progresso da instituição.

A concessão de reconhecimento deverá depender de critérios publicados, evidências verificadas e aprovação formal.

Não apresentar essa acreditação privada como certificação pública ou comprovação automática de cumprimento legal.

---

## 19. GESTÃO COMERCIAL E FINANCEIRA

Criar módulo administrativo para a CERTTIFICA com:

- Cadastro de clientes.
- Propostas comerciais.
- Planos de contratação.
- Contratos.
- Renovação contratual.
- Mensalidades.
- Serviços adicionais.
- Histórico de pagamentos.
- Despesas com parceiros.
- Receita recorrente.
- Relatórios de rentabilidade.
- Controle de entregas por contrato.

Preparar integrações futuras com plataformas de pagamento e emissão fiscal.

Dados bancários e de pagamento deverão ser tratados por provedores adequados.

---

## 20. OPERAÇÃO REMOTA E REDE DE PARCEIROS

A CERTTIFICA deverá conseguir coordenar a operação sem deslocamentos frequentes.

Criar fluxo:

Escola solicita serviço → NEXO classifica solicitação → CERTTIFICA valida → sistema identifica profissionais habilitados e disponíveis → parceiro aceita → atividade é executada → evidências são registradas → responsável valida → histórico e indicadores são atualizados.

Incluir:

- Agenda de parceiros.
- Localização por região de atendimento.
- Qualificações e validade documental.
- Controle de solicitações.
- Ordens de serviço.
- Comprovação de execução.
- Avaliação.
- Pagamento.

Atividades realizadas remotamente deverão ter um fluxo diferente daquelas que exigem presença física.

---

## 21. MOTOR CENTRAL DE AUTOMAÇÕES

Criar um mecanismo configurável de regras, eventos e tarefas programadas.

Gatilhos:

- Novo colaborador.
- Novo documento.
- Vencimento próximo.
- Atraso em plano de ação.
- Treinamento pendente.
- Nova ocorrência.
- Atualização de diagnóstico.
- Início de novo mês.
- Nova contratação.
- Nova solicitação de serviço.
- Falha em integração.
- Alteração de obrigação cadastrada.

Ações:

- Criar tarefa.
- Notificar usuário.
- Solicitar evidência.
- Agendar revisão.
- Gerar minuta.
- Atualizar indicador.
- Abrir solicitação de serviço.
- Escalar pendência.
- Preparar relatório.

As automações deverão ter logs, controle de repetição, proteção contra disparos duplicados, tentativas de reexecução e possibilidade de correção manual.

Disponibilizar um painel para ativar, desativar e parametrizar regras sem necessidade de alterar o código.

---

## 22. EXPERIÊNCIA VISUAL E USABILIDADE

Criar uma interface de padrão corporativo, moderna, elegante e intuitiva.

Identidade:

**CERTTIFICA APRESENTA NEXO**

**Inteligência que conecta. Gestão que transforma.**

Orientações:

- Visual sofisticado.
- Navegação simples.
- Menus organizados.
- Cards de indicadores.
- Gráficos interativos.
- Calendário.
- Alertas visuais.
- Interface responsiva.
- Acessibilidade.
- Boa experiência em notebook, tablet e celular.
- Layout adequado para gestores não técnicos.
- Idioma principal: português brasileiro.
- Datas no formato brasileiro.
- Moeda em reais.
- Fuso horário configurável por instituição.

Criar um design system reutilizável.

O NEXO deve transmitir inteligência, organização, segurança e capacidade de gestão.

---

## 23. PERFIS DE ACESSO

Criar permissões por função, instituição, unidade e módulo.

Perfis iniciais:

1. Superadministrador da plataforma.
2. Direção CERTTIFICA.
3. Equipe técnica de Promoção da Saúde.
4. Equipe técnica de Saúde Emocional.
5. Responsável por Tecnologia.
6. Consultor ou gestor de contas.
7. Diretor da escola.
8. Gestor administrativo ou RH.
9. Responsável interno de segurança.
10. Colaborador.
11. Profissional parceiro.
12. Administrador financeiro.

Permitir permissões personalizadas.

Os usuários não poderão visualizar dados de outras instituições sem autorização específica.

---

## 24. SEGURANÇA, LGPD E GOVERNANÇA

Implementar desde o início:

- Autenticação segura.
- Recuperação de senha.
- Autenticação multifator para acessos privilegiados.
- Controle de sessão.
- Permissões granulares.
- Separação de dados por instituição.
- Criptografia em trânsito e em repouso.
- Logs de auditoria.
- Backups.
- Rotinas de recuperação.
- Políticas de retenção e descarte.
- Proteção de dados sensíveis.
- Restrições de acesso às informações pessoais.
- Procedimentos de gestão de incidentes.
- Exportação de dados autorizados.
- Auditoria de alterações críticas.
- Controles de privacidade por finalidade.

Desenvolver controles para dados de crianças e adolescentes quando pertinentes, considerando suas proteções legais específicas.

Não disponibilizar diagnósticos individuais ou relatos sigilosos em dashboards gerenciais.

---

## 25. ARQUITETURA TÉCNICA

Proponha uma arquitetura moderna, segura e escalável, priorizando facilidade de manutenção.

Tecnologias sugeridas, a avaliar conforme o repositório:

- Next.js com TypeScript.
- React.
- Tailwind CSS.
- Componentes acessíveis e reutilizáveis.
- PostgreSQL.
- ORM com migrações.
- Autenticação robusta.
- Armazenamento seguro de documentos.
- Fila de tarefas.
- Processamento assíncrono de automações.
- API documentada.
- Integrações por webhooks.
- Sistema de notificações.
- Geração de PDF.
- Exportação de relatórios.
- Arquitetura modular e multi-tenant.
- Infraestrutura compatível com deploy na Vercel, quando tecnicamente adequado.

Não depender exclusivamente de funções efêmeras da Vercel para tarefas críticas de longa duração, filas ou agendamentos.

Preparar a aplicação para expansão de capacidade e possível separação de serviços.

### Integrações previstas

- E-mail.
- WhatsApp Business por integração oficial.
- Google Calendar ou Microsoft Calendar.
- Videoconferência.
- Sistemas de RH.
- Importação e exportação de planilhas.
- Assinatura eletrônica.
- Plataformas de pagamento.
- Serviços autorizados de inteligência artificial.

Usar adaptadores e interfaces para que provedores possam ser configurados posteriormente, sem inventar chaves ou credenciais.

---

## 26. EXPANSÃO PARA MUNICÍPIOS E CIDADES INTELIGENTES

A arquitetura não deverá limitar a CERTTIFICA exclusivamente ao setor escolar.

O NEXO será inicialmente aplicado às instituições de ensino, mas deverá permitir expansão futura para:

- Redes municipais de educação.
- Secretarias municipais.
- Gestão pública de saúde e prevenção.
- Programas territoriais de promoção da saúde.
- Gestão integrada de riscos.
- Indicadores municipais.
- Cidades inteligentes.

Preparar a hierarquia:

Organização → Rede → Instituição → Unidade → Setor.

Garantir que regras, módulos, dashboards e permissões possam ser adaptados a diferentes segmentos.

Não implementar módulos municipais completos nesta primeira etapa. Apenas preparar a arquitetura para expansão.

---

## 27. ETAPAS DE IMPLEMENTAÇÃO PELO CODEX

Não tente entregar tudo em uma única alteração desorganizada.

Antes de programar:

1. Inspecione o repositório existente.
2. Identifique tecnologias e dependências disponíveis.
3. Proponha a arquitetura e os módulos.
4. Documente o modelo de dados.
5. Defina perfis, permissões e isolamento multi-tenant.
6. Crie um plano de desenvolvimento por fases.
7. Identifique integrações que exigem credenciais.
8. Identifique pontos que exigem validação jurídica ou técnica.

### FASE 1 — FUNDAÇÃO FUNCIONAL

Construir:

- Estrutura do projeto.
- Banco de dados.
- Autenticação.
- Gestão de usuários.
- Multi-tenant.
- Central CERTTIFICA.
- Portal Escola.
- Cadastro de unidades.
- Dashboard inicial.
- Controle de permissões.
- Auditoria básica.

### FASE 2 — GESTÃO OPERACIONAL

Construir:

- Diagnóstico.
- Matriz de obrigações.
- Cadastro de colaboradores.
- Documentos.
- Planos de ação.
- Ocorrências.
- Treinamentos.
- Calendário.
- Notificações.

### FASE 3 — SAÚDE E PREVENÇÃO

Construir:

- Psicossocial.
- Saúde emocional e bem-estar.
- Espaço Pausa.
- Lei Lucas.
- Ser Saúde na Escola.
- Campanhas.
- Comunicação com famílias.

### FASE 4 — INTELIGÊNCIA E AUTOMAÇÃO

Construir:

- Motor de automações.
- Painéis avançados.
- Central de Inteligência.
- Relatórios.
- Reuniões mensais.
- Assistente de IA com controles de segurança.
- Fluxos de escalonamento.

### FASE 5 — OPERAÇÃO COMERCIAL

Construir:

- Portal de parceiros.
- Solicitação de serviços.
- Contratos.
- Financeiro.
- Acreditação.
- Integrações.

### FASE 6 — CONSOLIDAÇÃO E EXPANSÃO

Executar:

- Testes automatizados.
- Testes de isolamento de dados.
- Testes de permissões.
- Testes de automações e filas.
- Testes de acessibilidade.
- Revisão de segurança.
- Validação da experiência em dispositivos móveis.
- Otimização de desempenho.
- Documentação de implantação.
- Preparação para múltiplas redes e municípios.

---

## 28. REGRAS OBRIGATÓRIAS DE DESENVOLVIMENTO

- Não criar somente telas estáticas.
- Não utilizar dados fictícios como se fossem dados reais.
- Não afirmar que integrações estão funcionando sem testes.
- Não colocar chaves secretas no código.
- Não expor dados entre instituições.
- Não permitir que IA altere decisões sensíveis sem aprovação.
- Não declarar conformidade legal automaticamente.
- Não confundir módulos de saúde organizacional com assistência clínica.
- Não emitir certificados ou pareceres técnicos sem requisitos e validações necessários.
- Não realizar deploy em produção sem autorização.
- Não sobrescrever código existente sem antes avaliar o impacto.
- Utilizar migrações versionadas.
- Implementar testes nos fluxos essenciais.
- Criar documentação clara para manutenção futura.

Manter separação entre funcionalidades implementadas, simuladas, pendentes e dependentes de serviços externos.

---

## 29. ENTREGÁVEIS

Ao concluir cada fase, apresentar:

1. Funcionalidades desenvolvidas.
2. Estrutura de arquivos.
3. Alterações no banco de dados.
4. Rotas e serviços criados.
5. Testes executados e resultados.
6. Pendências e limitações.
7. Credenciais ou serviços externos ainda necessários.
8. Instruções de execução.
9. Próximas prioridades.

Criar documentação técnica e operacional.

Preparar dados demonstrativos identificados claramente como demonstração, com escolas, unidades e colaboradores fictícios, para permitir testes sem dados pessoais reais.

---

## 30. RESULTADO ESPERADO

Quero que o NEXO seja a estrutura tecnológica responsável por permitir à CERTTIFICA operar em escala.

A plataforma deverá centralizar informações, transformar obrigações em fluxos organizados, antecipar pendências, coordenar profissionais, acompanhar resultados e gerar inteligência para decisões institucionais.

A CERTTIFICA deverá conseguir:

- Gerenciar múltiplas escolas em uma única interface.
- Trabalhar remotamente de qualquer lugar.
- Reduzir atividades administrativas manuais.
- Manter histórico e evidências de suas entregas.
- Coordenar treinamentos presenciais por parceiros.
- Realizar reuniões estratégicas on-line.
- Monitorar riscos, prevenção, saúde e bem-estar.
- Oferecer relatórios profissionais.
- Expandir suas operações sem aumentar proporcionalmente a equipe interna.
- Preparar sua evolução para redes de ensino e municípios.

**INSTRUÇÃO FINAL AO CODEX:**

Comece inspecionando o projeto e criando o documento `PLANO_DESENVOLVIMENTO_NEXO.md`, com a arquitetura, os módulos, o banco de dados, as dependências, as fases e os critérios de aceitação.

Depois, inicie a implementação funcional da Fase 1, incluindo banco de dados, autenticação, isolamento entre instituições e painel administrativo inicial.

Trabalhe de forma incremental, com commits organizados e testes. Não realize publicação em produção sem autorização.

O objetivo não é criar apenas um software de gestão escolar.

**O objetivo é construir a infraestrutura digital de inteligência, gestão e expansão da CERTTIFICA.**
