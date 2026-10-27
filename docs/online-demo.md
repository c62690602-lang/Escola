# Demonstração online do sistema NEXO

Esta é a aplicação de gestão com login, PostgreSQL, instituições, implantação e tarefas. O site institucional/comercial existente no GitHub, na branch `nexo-site`, é outro projeto e não será substituído.

## Hospedagem proposta

O arquivo `render.yaml` descreve uma instância web Node.js e um PostgreSQL separado no Render, com HTTPS gerenciado pelo provedor. Não usa o banco local do Codex e não publica arquivos `.env.local`, backups, caixa de saída ou dados desta máquina.

A configuração solicita planos `free`, quando disponíveis na conta e região. Confira as condições atuais no painel antes de criar recursos: planos gratuitos podem suspender por inatividade, limitar recursos ou expirar o banco. Não trocar automaticamente por plano pago. Não foi feita cobrança nem criada uma conta de hospedagem pelo assistente.

## Publicar

1. O código do sistema precisa estar em uma branch própria do repositório `c62690602-lang/Escola`, com `render.yaml`. Não selecionar a branch `nexo-site` para hospedar o sistema de gestão.
2. Na conta Render, criar um Blueprint a partir desse repositório/branch e conferir os dois serviços propostos e respectivos planos. A conta precisa ter acesso de leitura ao repositório GitHub.
3. O provedor gera `DEMO_PASSWORD` e injeta a conexão privada `DATABASE_URL`. Não copiar chaves ou senhas para o chat. A senha da demonstração pode ser consultada pelo proprietário na área segura de variáveis do serviço.
4. A inicialização executa migrações, cria contas fictícias na primeira execução e inicia Next.js no modo de produção, na porta fornecida pelo provedor. Reiniciar não redefine senhas nem apaga registros existentes.
5. Usar o endereço HTTPS real atribuído pelo Render. `RENDER_EXTERNAL_URL` define a origem permitida para login e mutações; domínio próprio exige configurar `APP_ORIGIN` com a origem HTTPS exata e reiniciar.
6. Entrar com `admin@nexo.example` para testar operações ou `diretor@nexo.example` para leitura da instituição fictícia. Ambos usam inicialmente a senha gerada no painel. Não inserir dados reais nesta demonstração.

A aplicação desativa entrega local de recuperação quando `PUBLIC_DEMO=true`; o fluxo informa sua indisponibilidade, sem fingir envio de e-mail. Não há MFA nem entrega real de e-mail nesta etapa. Não disponibilizar como serviço comercial de produção.

## Verificações antes de compartilhar

- `/api/health` retorna 200 somente quando o PostgreSQL responde.
- Login e logout funcionam no domínio HTTPS final; o cookie de sessão tem Secure, HttpOnly e SameSite.
- Uma instituição nova mostra estados vazios. Cadastro, implantação e conclusão de tarefa persistem após reinício.
- Diretor não administra acessos nem grava tarefas; tentativas de outra instituição são negadas.
- Recuperação local é negada na demonstração pública e arquivos privados não são servidos.
- Páginas têm `X-Robots-Tag` e `robots.txt` para não indexação. Isso não substitui autenticação.

Acesso online só é considerado entregue depois de um deploy confirmado e destes testes no endereço final. Build e teste local, branch no GitHub e publicação do ambiente Codex não comprovam hospedagem externa. Nunca anunciar um link presumido.
