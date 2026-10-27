# Resultados de validação desta instância

Ambiente: Node.js 24.19.0, npm 11.9.0, Next.js 16.4.3, PostgreSQL 17 em Docker. Dependências resolvidas no package-lock.json. Banco e usuários somente sintéticos.

| Verificação                            | Resultado                                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Instalação com npm ci e setup repetido | Aprovada; mantém configuração local e registros existentes                                                                  |
| Migração SQL repetida                  | Aprovada, em transação                                                                                                      |
| Testes de domínio/integração           | 18 aprovados, 0 falhas, 0 ignorados                                                                                         |
| Smoke HTTP                             | Aprovado: login, sessão, criação, implantação, atualização, relatório, isolamento, permissões, origem e logout              |
| Navegador Chromium / Playwright        | 2 fluxos aprovados: operação central e convites/papéis/recuperação/revogação; desktop e celular                             |
| Acessibilidade automatizada axe        | Sem violações WCAG 2 A/AA nas telas verificadas: login, tarefas, visão geral, acessos, convite e solicitação de recuperação |
| Lint                                   | Aprovado, sem erros ou avisos                                                                                               |
| TypeScript                             | Aprovado                                                                                                                    |
| Build de produção                      | Aprovado                                                                                                                    |
| Backup e restauração                   | Dump restaurado em banco temporário independente, com 2 usuários fictícios e 1 instituição; banco temporário removido       |

As verificações automatizadas de acessibilidade são parciais, não uma certificação de acessibilidade. O teste de navegador verifica ausência de rolagem horizontal na largura de 390 px. O relatório JSON e o progresso são conferidos pelo teste HTTP. A tentativa de usar ID de tarefa da escola B em rota da escola A é negada no serviço. Acolhimento é sempre negado porque o módulo está indisponível.

Falhas encontradas e corrigidas: cache npm sem diretório gravável (cache movido ao workspace); verificação de origem comparando hostname interno (usa autoridade da requisição ou APP_ORIGIN configurado); bloqueio de recursos de desenvolvimento para 127.0.0.1 (origens locais declaradas); contraste insuficiente de textos e badges (cores corrigidas); possibilidade de arquivar etapas obrigatórias (negada pelo servidor para preservar o denominador do progresso). Formulário de login usa POST mesmo sem JavaScript, evitando credenciais em query string.

O navegador para download foi bloqueado pela política de rede; a validação final utilizou o Chromium já instalado. A lista de rede foi mantida sem domínios adicionais. Artefatos de testes e configuração local são ignorados pelo Git. Testes removem seus registros, preservando somente a demonstração inicial.

Não foram executados: teste de carga, pentest, recuperação de desastre da infraestrutura, nova tarefa após publicação, envio de e-mail, MFA, documentos privados, PDFs, integrações externas e todos os módulos futuros. Nenhum deploy de produção ou merge foi realizado. A configuração foi salva como rascunho; publicação pelo produto é uma etapa separada.

Nesta etapa foram testados expiração, revogação e consumo concorrente de convites, proibição de escalada de papel, autorização de conta existente e invalidação de sessões. O teste de recuperação usa entrega local privada de demonstração, sem e-mail real. Corrigidos rótulos dos seletores, tratamento de novos links no mesmo caminho de recuperação e encerramento do pool de testes somente ao terminar o worker Playwright. O servidor de desenvolvimento foi reiniciado após a interrupção do ambiente.

Preparação da demonstração online: build de produção aprovado, inicialização pelo script hospedado em banco PostgreSQL novo, health check, login das contas fictícias, cookie Secure, validação de origem HTTPS simulada via cabeçalho, bloqueio da recuperação local e não indexação verificados. Reinício preservou as duas contas e uma instituição, sem duplicação. Estes testes foram locais: ainda não houve deploy em um provedor nem validação de URL pública.
