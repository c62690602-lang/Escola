# Implantar o NEXO na Vercel

O repositório usa a branch `nexo-site`, que também é a branch padrão atual no GitHub. O projeto Next.js está na raiz; não há subpasta `Escola` dentro do repositório.

## Se o repositório não aparece

1. Entre em https://vercel.com/new com a conta desejada.
2. Na área de importação do GitHub, use a opção de configurar o acesso da integração Vercel ao GitHub.
3. Autorize o repositório `c62690602-lang/Escola` na instalação da integração. Não é necessário tornar o repositório público nem compartilhar tokens.
4. Volte à importação, atualize a lista e selecione `Escola`.

Os nomes dos botões podem variar conforme o idioma e a versão do painel.

## Configurações do projeto

| Campo | Valor |
| --- | --- |
| Framework Preset | Next.js |
| Branch | nexo-site |
| Root Directory | raiz do repositório (`.`); não escolher `app` nem `Escola` |
| Node.js Version | 24.x |
| Install Command | npm ci |
| Build Command | npm run build |
| Output Directory | padrão do Next.js, sem sobrescrever como `out`, `build` ou `dist` |

O arquivo `vercel.json` registra o framework e os comandos. `package.json` define Node.js 24.x. O site contém backend: não use hospedagem de arquivos estáticos nem configure exportação estática.

Para um projeto já importado, confira as configurações acima, abra o deploy que falhou e use a opção de redeploy. Confirme que a revisão é o commit mais recente de `nexo-site`, não uma revisão anterior.

## Preciso configurar banco para conseguir visualizar?

Não. A home e as páginas públicas devem compilar e abrir sem `DATABASE_URL` e sem `ADMIN_PASSWORD`. Essas variáveis são necessárias para captar contatos e consultar a administração na hospedagem, respectivamente. Sem banco, a tentativa de envio retorna indisponibilidade; não há sucesso falso. Sem senha administrativa, o login fica desabilitado.

Não copie o endereço `http://localhost:3000` como URL de um site publicado. Quando a Vercel fornecer o endereço HTTPS do projeto, defina `NEXT_PUBLIC_SITE_URL` com esse endereço nas variáveis do projeto e faça novo deploy. Consulte o README para banco, senha administrativa e demais integrações. Nunca coloque credenciais no GitHub ou em mensagens de chat.

## Como identificar o erro exato

No painel da Vercel, abra o projeto e o deploy com falha. Acesse os logs de build e localize a primeira mensagem de erro, geralmente perto do final. Copie a mensagem e algumas linhas de contexto, removendo qualquer credencial ou URL de banco que contenha senha. A frase final `Command exited with 1` sozinha não identifica a causa.

Se o deploy ficar pronto, mas a página não abrir, envie o endereço público e o texto mostrado na tela. Se houver erro 500, consulte também os logs de runtime. Se houver uma solicitação de login na Vercel, pode ser proteção de acesso do deploy, não falha da aplicação.

O build local é validado separadamente. Sem acesso ao projeto e aos logs da sua conta, não é possível afirmar qual erro ocorreu no build remoto ou confirmar que o site foi implantado.
