# Usuários, convites e recuperação

## Gestão pela interface

Entre como administrador Certtifica e abra **Usuários e acessos** no menu lateral. Selecione a instituição. A tela lista os vínculos e os últimos 100 convites. Somente administradores globais podem listar e gerenciar acessos; esta regra é verificada no servidor. Não se pode conceder administração global pela tela ou pelo convite.

Papéis fixos: gestor, diretor, especialista, RH e acolhimento. Nesta etapa o gestor pode operar e os demais papéis têm leitura de registros operacionais não sensíveis. Acolhimento permanece indisponível para todos. Permissões por módulo/unidade ainda não foram implementadas.

Alteração de papel e revogação de vínculo encerram as sessões da pessoa em **todas** as instituições. Revogar vínculo não apaga conta, histórico ou vínculos com outras escolas. Administradores globais não são rebaixados por esta operação.

## Convite

Informe e-mail e papel e clique em **Gerar convite**. O link privado aparece apenas nessa geração, para compartilhamento manual autorizado; nenhum e-mail é enviado automaticamente. O link contém uma credencial temporária: não publicar, capturar em relatórios, logs ou compartilhar fora do destinatário.

Validade de 48 horas, uso único, token aleatório de 256 bits e somente hash no banco. Gerar novo convite revoga convites pendentes anteriores para o mesmo e-mail e instituição. Convite expirado ou revogado não concede acesso. Aceitação usa transação e bloqueio de linha para impedir uso concorrente.

Uma pessoa sem conta define nome e senha de pelo menos 14 caracteres. Para uma conta existente é obrigatório estar autenticado com a própria conta convidada; o convite nunca substitui a senha dessa conta. Não há login automático após aceitação. O convite não sobrescreve um vínculo já existente. Alterar vínculo existente requer a tela administrativa.

## Recuperação local de demonstração

Em **Esqueci minha senha**, informe o e-mail. Com DEMO_MODE=true, a solicitação gera uma mensagem local privada em `.local/mail/<id>.json`. O operador pode abrir localmente o arquivo correspondente para testar o caminho de recuperação. Não imprimir tokens em logs ou chat. O diretório não é servido pela aplicação nem incluído no Git; arquivos têm permissão 0600 e diretório 0700 na criação. São entregas de teste, não e-mails reais.

A resposta é igual para conta inexistente e limite excedido. Limite de três solicitações por conta em 15 minutos, com prefixo separado do limite de login. Uma nova solicitação revoga os tokens anteriores. Validade de 30 minutos, uso único e senha de pelo menos 14 caracteres. A redefinição invalida todas as sessões e gera auditoria. O link usa fragmento, que não é enviado ao servidor pela navegação; o cliente remove o fragmento da barra e envia o token no corpo JSON ao confirmar. Novos links abertos na mesma página também são processados.

Fora do modo de demonstração, o endpoint retorna 503 até existir entrega segura real. Configuração de SMTP/provedor, templates, confirmação de entrega, retenção da caixa de saída e controles adicionais contra abuso são pendências. Não usar esse mecanismo local como recuperação de produção. MFA permanece pendente.

## API

Todas as mutações exigem JSON e origem válida. As rotas institucionais exigem sessão de administrador global e validam o escopo da instituição.

| Método / rota                                           | Entrada / resultado                                                          |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| GET `/api/institutions/:id/access`                      | Pessoas vinculadas e histórico de convites, sem hashes nem tokens            |
| POST `/api/institutions/:id/invitations`                | `{email,role}`; retorna `{id,token}` uma única vez ao administrador          |
| PATCH `/api/institutions/:id/invitations/:invitationId` | Revoga convite pendente                                                      |
| PATCH `/api/institutions/:id/members/:userId`           | `{role}` ou `{revoke:true}`                                                  |
| POST `/api/auth/invitations/accept`                     | `{token,name,password?}`; exige sessão correspondente quando conta já existe |
| POST `/api/auth/recovery`                               | `{email}`; resposta genérica; somente entrega local em demonstração          |
| POST `/api/auth/reset`                                  | `{token,password}`; redefinição e revogação de sessões                       |

Respostas 403 para autorização negada, 409 para convite/token indisponível ou conflito, 400 para entradas inválidas e 503 para entrega não configurada. Tokens expirados, consumidos e revogados são rejeitados no banco. As rotas não concedem acesso confidencial a nenhum perfil.
