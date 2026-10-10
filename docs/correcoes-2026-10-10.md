# Correções de confiabilidade — 10/10/2026

## Banco de produção

No projeto Supabase `assistente-show`, a migração
`restrict_product_image_management_to_admins` foi aplicada em 10/10/2026.
O SQL correspondente está em `supabase/fix_product_image_permissions.sql`.
A política `Allow admin uploads` agora exige usuário autenticado e e-mail
presente em `public.admin_users`, seguindo a autorização já usada por produtos
e técnicos. A política cobre SELECT/INSERT/UPDATE/DELETE, incluindo upsert.
O bucket continua público para preservar as URLs das imagens do catálogo.
Nenhum arquivo ou registro comercial foi removido.

Verificação das expressões USING e WITH CHECK da política instalada:
visitante bloqueado; usuário comum bloqueado; administrador permitido;
administrador em outro bucket bloqueado. A lista de políticas também foi
conferida para excluir permissões adicionais que anulassem a restrição.
Não foi realizado upload com uma sessão real de administrador.

## Aplicação

- Só atualiza listas e informa sucesso após confirmação do banco.
- Edições e exclusões exigem uma linha retornada; resposta sem linha não é sucesso.
- Formulários de oportunidades, comissões, vendedores e kits aguardam a resposta,
  mantêm os campos em caso de falha e bloqueiam submissões repetidas pendentes.
- Falhas ao carregar são explícitas e oferecem nova tentativa, sem dados fictícios.
- Dashboard filtra vendas e comissão prevista pelo mês e ano locais.
- Orçamento Inteligente continua desabilitado; regras comerciais não foram alteradas.

## Verificação

- `npm test`: 14 testes de regressão, usando o cliente Supabase real com transporte HTTP simulado.
- `npx tsc --noEmit --incremental false`: passou.
- `npm run build`: passou.
- `tests/browser-regressions.cjs`: dashboard mensal, falha de cadastro de comissão,
  prevenção de clique duplicado, preservação do formulário, nova tentativa com sucesso,
  exclusão rejeitada, salvamento de kit e recuperação de falha de leitura.
  Rodou em Brave/Playwright contra o build local, interceptando as chamadas externas.
  Nenhum dado real foi utilizado ou alterado pelos testes de navegador.

Para repetir os testes de navegador, disponibilize `playwright` no ambiente,
execute a aplicação localmente na porta 3100 e rode
`node tests/browser-regressions.cjs`. As variáveis `TEST_BASE_URL` e
`TEST_BROWSER_EXECUTABLE` permitem definir servidor e navegador; `NODE_PATH`
pode apontar para a instalação de Playwright. Não precisa de credenciais reais.

## Publicação

A alteração de permissão já está ativa no Supabase.
As alterações da aplicação serão entregues em PR; a produção Vercel permanece
no commit `fd8f2ca` até a incorporação e publicação dessa PR.
Os scripts SQL antigos não representam integralmente o banco atual e não devem
ser reaplicados para efetuar esta correção.
