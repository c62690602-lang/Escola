export type Section = { title: string; text?: string; items?: string[] };
export type PageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Section[];
  note?: string;
};
export const pages: Record<string, PageContent> = {
  solucao: {
    eyebrow: "A SOLUÇÃO",
    title: "Tudo se conecta. A gestão evolui.",
    intro:
      "O NEXO é um programa anual que une plataforma digital, implantação, acompanhamento técnico e gestão preventiva. Para a direção ter contexto, para as equipes terem apoio e para o cuidado acontecer durante todo o ano.",
    sections: [
      {
        title: "Tecnologia com pessoas por perto",
        text: "Você não recebe apenas um software para alimentar sozinho. Organizamos juntos prioridades, processos e informações e acompanhamos a evolução em uma reunião estratégica mensal.",
      },
      {
        title: "Três frentes. Uma visão integrada.",
        items: [
          "NEXO Psicossocial: organização do trabalho e medidas preventivas.",
          "NEXO Prontidão: preparação contínua em primeiros socorros.",
          "SER Saúde na Escola: prevenção e promoção da saúde ao longo do ano.",
        ],
      },
      {
        title: "Uma base que sustenta o programa",
        items: [
          "Central de Inteligência e Painel Executivo.",
          "Planos de ação com responsáveis e prazos.",
          "Protocolos, documentos e evidências.",
          "Acompanhamento mensal e jornada de Acreditação NEXO.",
        ],
      },
      {
        title: "Além da plataforma",
        text: "Espaço Pausa, Cuidado Individual, experiências para famílias e profissionais e Experiência Digital são possibilidades complementares, com escopo definido em proposta personalizada.",
      },
    ],
    note: "O NEXO apoia a gestão de saúde, segurança e prevenção. Notas, matrículas, finanças e gestão pedagógica tradicional não fazem parte do seu propósito.",
  },
  modulos: {
    eyebrow: "ECOSSISTEMA NEXO",
    title: "Frentes diferentes. O mesmo cuidado.",
    intro:
      "Saúde, segurança e organização do trabalho deixam de ser iniciativas isoladas e passam a compor uma jornada acompanhada.",
    sections: [
      {
        title: "NEXO Psicossocial",
        text: "Identificar fatores relacionados ao trabalho, priorizar intervenções e acompanhar as condições institucionais.",
      },
      {
        title: "NEXO Prontidão",
        text: "Preparar as equipes para agir, com capacitação prática, revisões, simulações e histórico de participação.",
      },
      {
        title: "SER Saúde na Escola",
        text: "Transformar prevenção em rotina, com campanhas, orientações e protocolos adequados à comunidade escolar.",
      },
      {
        title: "Inteligência transversal",
        text: "Painel Executivo, planos de ação, protocolos e evidências conectam as três frentes. Acompanhamento mensal transforma informação em próximas prioridades.",
      },
    ],
  },
  psicossocial: {
    eyebrow: "NEXO PSICOSSOCIAL",
    title: "Cuidar antes que o desgaste se transforme em problema.",
    intro:
      "Gestão preventiva dos fatores psicossociais relacionados à organização do trabalho, com foco nas condições institucionais e na construção de medidas possíveis.",
    sections: [
      {
        title: "O trabalho também precisa de cuidado",
        items: [
          "Sobrecarga, ritmo de trabalho e organização da rotina.",
          "Pausas, apoio e condições de trabalho.",
          "Comunicação, conflitos e exigência emocional.",
          "Pressão na relação com famílias.",
          "Clareza de funções, reconhecimento e pertencimento.",
        ],
      },
      {
        title: "Da escuta à ação acompanhada",
        text: "Identificar → Priorizar → Agir → Definir responsável → Acompanhar → Avaliar resultados. Cada prioridade ganha um plano e um momento de revisão.",
      },
      {
        title: "Exemplo de aplicação",
        text: "Ao identificar demandas concentradas em um turno, a instituição pode revisar a distribuição de atividades, definir responsáveis e acompanhar se a rotina se tornou mais viável. É um exemplo de uso, sem garantia de resultado.",
      },
      {
        title: "Integração com a gestão de riscos",
        text: "As informações podem apoiar a gestão de riscos ocupacionais e as iniciativas relacionadas à NR-1, quando aplicáveis. A análise depende do contexto e da atuação de profissionais habilitados.",
      },
    ],
    note: "O programa não assegura conformidade automática nem substitui profissionais habilitados ou certificação regulatória. O foco é melhorar a organização do trabalho, sem responsabilizar individualmente o trabalhador.",
  },
  prontidao: {
    eyebrow: "NEXO PRONTIDÃO · LEI LUCAS",
    title: "Uma emergência não espera o próximo treinamento.",
    intro:
      "Preparação contínua em primeiros socorros para que conhecimento, organização e prática acompanhem as mudanças da equipe.",
    sections: [
      {
        title: "Aprender, praticar, revisar",
        items: [
          "Capacitações práticas e uso de manequins realistas em experiências presenciais previstas na proposta.",
          "Revisões, vídeos, simulações e lembretes de atualização.",
          "Registro de participantes e histórico de capacitações.",
        ],
      },
      {
        title: "A equipe muda. A preparação acompanha.",
        items: [
          "Integração de novos funcionários.",
          "Acompanhamento por turno.",
          "Treinamentos concluídos e pendentes.",
          "Evidências e próximas ações de preparação.",
        ],
      },
      {
        title: "Mais do que um certificado",
        text: "Mais importante do que guardar um certificado é saber como agir quando realmente precisar. O acompanhamento ajuda a identificar lacunas e planejar novas práticas.",
      },
      {
        title: "Lei Lucas e contexto local",
        text: "A preparação deve considerar a Lei nº 13.722/2018, normas locais, público atendido e condições concretas da instituição, com avaliação técnica pertinente.",
      },
    ],
    note: "A participação no programa não garante, por si só, atendimento a todos os requisitos legais. Conteúdo informativo: não constitui orientação de atendimento a emergências.",
  },
  "ser-saude": {
    eyebrow: "SER SAÚDE NA ESCOLA",
    title: "A prevenção acontece durante todo o ano.",
    intro:
      "Um calendário vivo de promoção da saúde, adaptado às faixas etárias, às estações e às necessidades reais da comunidade escolar.",
    sections: [
      {
        title: "Retorno às aulas · organizar e orientar",
        items: [
          "Acolhimento e promoção de hábitos saudáveis.",
          "Orientações às famílias e conteúdos por faixa etária.",
          "Revisão de protocolos, POPs e fluxogramas.",
        ],
      },
      {
        title: "Ao longo do ano · prevenir e acompanhar",
        items: [
          "Prevenção de doenças, agravos e viroses.",
          "Educação postural e prevenção de acidentes.",
          "Ações de saúde e segurança.",
          "Campanhas sazonais e conscientização.",
        ],
      },
      {
        title: "A cada ciclo · avaliar e ajustar",
        text: "A instituição e a equipe técnica revisam a adesão às ações, os registros e as novas necessidades. O calendário é uma referência de planejamento, sem calendário clínico universal ou promessa de resultado.",
      },
    ],
  },
  "central-de-inteligencia": {
    eyebrow: "CENTRAL DE INTELIGÊNCIA",
    title: "Enquanto a escola funciona, a tecnologia acompanha.",
    intro:
      "Dados organizados, contexto para decidir e acompanhamento técnico para transformar informações em prioridades de gestão.",
    sections: [
      {
        title: "Uma visão conectada",
        items: [
          "PGR e inventários de riscos, quando aplicáveis.",
          "Fatores psicossociais e planos de ação.",
          "Treinamentos, novos colaboradores e histórico.",
          "Protocolos, POPs, documentos e prazos.",
          "Evidências, ações de saúde e bem-estar.",
        ],
      },
      {
        title: "Painel Executivo NEXO",
        text: "Equipe preparada, integração de novos colaboradores, treinamentos concluídos e pendentes, protocolos implantados e evolução dos planos. Indicadores organizam o acompanhamento sem expor relatos pessoais.",
      },
      {
        title: "A próxima prioridade fica visível",
        text: "Pendências, alertas e evolução do programa apoiam a reunião mensal e a definição de responsáveis. A interpretação técnica considera os limites e a qualidade dos dados.",
      },
    ],
    note: "Os indicadores exibidos neste site são fictícios e ilustrativos. Não representam clientes, resultados medidos ou um sistema de gestão já conectado a uma instituição.",
  },
  "como-funciona": {
    eyebrow: "JORNADA DO PROGRAMA",
    title: "Começamos juntos. Seguimos por perto.",
    intro:
      "Um programa anual com implantação estruturada nos primeiros 60 dias e acompanhamento recorrente. O escopo final é definido para a realidade de cada instituição.",
    sections: [
      {
        title: "01 · Implantação | primeiros 60 dias",
        items: [
          "Diagnóstico e conhecimento da instituição.",
          "Análise de documentos, processos e necessidades.",
          "Organização da estrutura de gestão e definição de prioridades.",
          "Implantação dos módulos e capacitação inicial.",
          "Configuração da plataforma e primeiros indicadores.",
        ],
      },
      {
        title: "02 · Acompanhamento contínuo",
        items: [
          "Monitoramento de prazos e atualização de treinamentos.",
          "Integração de novos colaboradores.",
          "Acompanhamento de riscos e execução dos planos.",
          "Campanhas de prevenção e registro de evidências.",
          "Atualização de indicadores e acompanhamento de melhorias.",
        ],
      },
      {
        title: "Uma reunião estratégica por mês",
        text: "O que está funcionando? O que evoluiu? O que merece atenção? Qual será a próxima prioridade? Uma conversa com contexto e encaminhamentos, para a evolução caber na rotina.",
      },
    ],
  },
  acreditacao: {
    eyebrow: "ACREDITAÇÃO NEXO",
    title: "Reconhecer o caminho. Incentivar o próximo passo.",
    intro:
      "Uma jornada de estruturação, acompanhamento e melhoria contínua, reconhecida pelo próprio programa Certtifica.",
    sections: [
      {
        title: "01 · Essencial",
        text: "Identifica • Organiza • Protege. Organização inicial de informações, prioridades e processos de cuidado.",
      },
      {
        title: "02 · Avançado",
        text: "Monitora • Intervém • Melhora. Acompanhamento de ações e revisão das medidas de prevenção.",
      },
      {
        title: "03 · Excelência",
        text: "Integra • Mede • Evolui. Integração de informações e avaliação contínua da evolução do programa.",
      },
      {
        title: "Reconhecimento com critérios",
        text: "Os critérios, evidências, validade e condições de concessão precisam ser formalizados pela Certtifica antes de qualquer reconhecimento efetivo. Os níveis não são planos de assinatura.",
      },
    ],
    note: "Reconhecimento privado próprio do programa Certtifica. Não é acreditação governamental nem certificação de conformidade legal. Os selos deste site são exemplos visuais; não indicam acreditações concedidas.",
  },
  experiencias: {
    eyebrow: "EXPERIÊNCIAS E CUIDADO",
    title: "Cuidar de quem cuida precisa caber na rotina.",
    intro:
      "Possibilidades que aproximam profissionais, famílias e instituição por meio de experiências planejadas de prevenção e bem-estar.",
    sections: [
      {
        title: "Espaço Pausa",
        items: [
          "Espaços de pausa planejados e microações de recuperação.",
          "Poltrona de massagem, quando oferecida.",
          "Quick massage, massoterapia e orientações ergonômicas.",
          "Educação postural, valorização e reconhecimento profissional.",
        ],
      },
      {
        title: "Cuidado Individual · quando escutar cedo faz diferença",
        text: "Possibilidades pontuais de escuta e acolhimento com profissionais habilitados, conforme o serviço contratado e os critérios éticos pertinentes. Para profissionais, pais e responsáveis e, quando realmente necessário, alunos, respeitados consentimentos e requisitos aplicáveis a menores.",
      },
      {
        title: "Acolhimento com limites claros",
        text: "O serviço não tem como finalidade emitir laudos, diagnósticos ou determinar afastamentos, nem substituir atendimento clínico quando necessário. Informações sensíveis, relatos pessoais e casos identificáveis não são divulgados.",
      },
      {
        title: "Famílias e profissionais",
        items: [
          "Primeiros socorros para famílias e promoção da saúde da criança.",
          "Hábitos saudáveis e educação postural.",
          "Massoterapia e ações de bem-estar.",
          "Eventos de prevenção, temas sazonais e integração da comunidade.",
        ],
      },
      {
        title: "Uma rede de cuidado",
        text: "Quando a escola cuida da família, fortalece a rede que cuida da criança.",
      },
    ],
    note: "Experiências presenciais e cuidado individual são planejados e contratados conforme a proposta. Bem-estar complementa, sem substituir, as melhorias necessárias na organização do trabalho.",
  },
  "experiencia-digital": {
    eyebrow: "EXPERIÊNCIA DIGITAL",
    title: "Uma presença digital à altura da sua escola.",
    intro:
      "A Certtifica pode desenvolver ou integrar recursos digitais para aproximar a instituição das famílias e apresentar o que ela tem de melhor.",
    sections: [
      {
        title: "Apresentar a instituição",
        items: [
          "Site institucional moderno e acessível.",
          "Proposta pedagógica, ambientes e projetos.",
          "Conteúdos para famílias e divulgação de eventos.",
          "Iniciativas de prevenção e cuidado.",
        ],
      },
      {
        title: "Facilitar novas conexões",
        items: [
          "Agendamento de visitas e formulários comerciais.",
          "Integração com WhatsApp em canal confirmado.",
          "Recursos de acessibilidade.",
          "Automações autorizadas, conforme finalidade e consentimento aplicáveis.",
        ],
      },
      {
        title: "Construção sob medida",
        text: "As integrações, responsabilidades, escopo e tratamento de dados são definidos em proposta específica, respeitando os sistemas e processos existentes.",
      },
    ],
    note: "Solução complementar de modernização digital. Não é uma funcionalidade incluída automaticamente em todas as contratações do NEXO.",
  },
  sobre: {
    eyebrow: "SOBRE A CERTTIFICA",
    title: "O cuidado encontra a inteligência.",
    intro:
      "A Certtifica é uma marca de soluções em educação, promoção da saúde, prevenção, tecnologia e inteligência de gestão, vinculada ao Grupo D’Aguiar Consultoria em TI.",
    sections: [
      {
        title: "Conectar para transformar",
        text: "Integramos promoção da saúde, saúde emocional, educação, segurança, tecnologia e inteligência de gestão. O NEXO é a primeira plataforma desse ecossistema, com foco inicial nas instituições de ensino.",
      },
      {
        title: "Pessoas e responsabilidades",
        text: "A estrutura institucional prevista reúne frentes de Promoção da Saúde, Saúde Emocional e Tecnologia. Nomes públicos, biografias e credenciais serão apresentados após confirmação e autorização dos envolvidos.",
      },
      {
        title: "Uma identidade em construção responsável",
        text: "A assinatura NEXO usada aqui é tipográfica e provisória. A identificação Certtifica é textual; os arquivos oficiais da marca serão incorporados após fornecimento e validação.",
      },
    ],
  },
  "visao-de-futuro": {
    eyebrow: "VISÃO DE FUTURO",
    title: "Começamos pela escola. Pensamos no território.",
    intro:
      "O NEXO foi concebido para conectar informações, apoiar políticas preventivas e fortalecer comunidades, começando pelo cotidiano das instituições de ensino.",
    sections: [
      {
        title: "01 · NEXO Escolas",
        text: "O ponto de partida: gestão preventiva, saúde e segurança no contexto escolar.",
      },
      {
        title: "02 · Rede NEXO",
        text: "Visão futura de conexão entre instituições e aprendizado compartilhado.",
      },
      {
        title: "03 · Observatório NEXO",
        text: "Visão futura de informações agregadas para leitura de necessidades coletivas, com governança e proteção de dados.",
      },
      {
        title: "04 · NEXO Municípios",
        text: "Visão futura de apoio a políticas preventivas e à gestão territorial.",
      },
      {
        title: "05 · Cidades inteligentes",
        text: "Horizonte de comunidades conectadas por informação útil e cuidado contínuo.",
      },
    ],
    note: "Rede, observatório, municípios e cidades inteligentes representam uma visão de expansão. Não são produtos apresentados como já implantados.",
  },
  conteudos: {
    eyebrow: "CONTEÚDOS",
    title: "Boas perguntas abrem novos caminhos.",
    intro:
      "Notas introdutórias para uma gestão mais conectada ao cuidado. Conteúdo editorial informativo, sujeito à revisão técnica e normativa antes da publicação.",
    sections: [
      {
        title: "Como começar um plano de ação preventivo?",
        text: "Comece por uma necessidade concreta, descreva a ação, indique uma pessoa responsável e estabeleça uma data de revisão. O acompanhamento permite avaliar o que mudou e ajustar o próximo passo.",
      },
      {
        title: "Por que acompanhar novos colaboradores?",
        text: "A preparação de uma equipe muda a cada contratação. Um histórico de integração e treinamento ajuda a identificar quem ainda precisa participar de atividades previstas no programa.",
      },
      {
        title: "O que levar à reunião mensal?",
        text: "Prioridades anteriores, ações realizadas, pendências e novas necessidades. Informações agregadas ajudam a conversar sobre a organização sem expor dados pessoais sensíveis.",
      },
    ],
    note: "Estes textos não substituem orientação jurídica, clínica ou de profissionais de saúde e segurança habilitados.",
  },
  privacidade: {
    eyebrow: "DOCUMENTO INICIAL · REVISÃO NECESSÁRIA",
    title: "Privacidade e proteção de dados.",
    intro:
      "Esta é uma minuta revisável. A identificação jurídica completa do controlador, o canal de direitos e a política final devem ser confirmados antes da publicação.",
    sections: [
      {
        title: "Dados e finalidade",
        text: "O formulário coleta nome, instituição, cargo, cidade/UF, e-mail profissional, telefone, interesse e, opcionalmente, tamanho da equipe, unidades e mensagem. Usamos esses dados para responder à solicitação e organizar o relacionamento comercial. Não envie dados de saúde ou informações de alunos.",
      },
      {
        title: "Base legal e escolhas",
        text: "A solicitação de contato é registrada junto à ciência deste aviso. A definição das bases legais aplicáveis deve ser validada pelo responsável por privacidade. A autorização de comunicações adicionais é opcional e registrada separadamente, podendo ser revogada.",
      },
      {
        title: "Armazenamento e acesso",
        text: "Os contatos são armazenados em banco com consulta administrativa autenticada. A infraestrutura de hospedagem e banco deve ser contratada e documentada antes da publicação. Não há venda de contatos nem integração com CRM habilitada nesta versão.",
      },
      {
        title: "Retenção e direitos",
        text: "A referência inicial de retenção é de até 180 dias, sujeita à validação jurídica e necessidades legítimas. O administrador pode excluir contatos e executar a rotina documentada de expurgo. O titular poderá solicitar acesso, correção, eliminação e outras providências pelo canal oficial, ainda a confirmar.",
      },
      {
        title: "Cookies e segurança",
        text: "Usamos cookie necessário de sessão somente para administração. A preferência de cookies é armazenada no navegador. Nenhum analytics, pixel ou cookie de marketing é carregado nesta versão. Sinais técnicos pseudonimizados são usados para limitar abuso, sem armazenar o IP original.",
      },
      {
        title: "Antes de publicar",
        text: "Confirmar razão social, CNPJ, endereço, encarregado ou canal de privacidade, operadores, transferências internacionais, prazos e bases legais. Esta minuta não representa parecer jurídico.",
      },
    ],
  },
  termos: {
    eyebrow: "DOCUMENTO INICIAL · REVISÃO NECESSÁRIA",
    title: "Termos de uso.",
    intro:
      "Minuta inicial para revisão jurídica antes da publicação. Ao navegar, considere o caráter informativo das apresentações do programa.",
    sections: [
      {
        title: "Finalidade do site",
        text: "Apresentar o NEXO e permitir solicitações comerciais. Escopo, disponibilidade, responsabilidades e condições de serviços dependem de proposta e contrato próprios.",
      },
      {
        title: "Demonstrações e limites",
        text: "O painel usa dados fictícios. Ilustrações de selos não comprovam acreditações concedidas. Não garantimos resultados de saúde, conformidade automática ou atendimento integral a requisitos legais.",
      },
      {
        title: "Conteúdos e propriedade intelectual",
        text: "A utilização de marcas, materiais e conteúdos depende das autorizações de seus titulares. Os ativos oficiais da Certtifica devem ser fornecidos e aprovados antes da publicação definitiva.",
      },
      {
        title: "Uso responsável",
        text: "Não envie informações sensíveis, dados de menores, conteúdo ilícito ou solicitações automatizadas abusivas. A administração pode bloquear tentativas de abuso e excluir dados enviados indevidamente.",
      },
      {
        title: "Responsáveis e contato",
        text: "Razão social, CNPJ, endereço, jurisdição e canal oficial serão complementados após confirmação da equipe responsável. Informações normativas sobre LGPD, NR-1 e Lei Lucas exigem revisão técnica e jurídica.",
      },
    ],
  },
};
export const moduleLinks = [
  {
    href: "/psicossocial",
    tag: "01",
    title: "NEXO Psicossocial",
    text: "Condições de trabalho melhores. Pessoas com mais apoio.",
    icon: "heart",
  },
  {
    href: "/prontidao",
    tag: "02",
    title: "NEXO Prontidão",
    text: "Preparar, praticar e manter a equipe pronta para agir.",
    icon: "shield",
  },
  {
    href: "/ser-saude",
    tag: "03",
    title: "SER Saúde na Escola",
    text: "Prevenção e hábitos saudáveis, de janeiro a dezembro.",
    icon: "leaf",
  },
];
