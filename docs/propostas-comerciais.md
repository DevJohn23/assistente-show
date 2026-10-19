# Modelos de orçamento e proposta comercial

Implementação em 18/10/2026.

## Uso

Em Minha conta → Preferências, escolha Básico, Detalhado ou Sóbrio e salve. O Básico mantém a apresentação com emojis; o Detalhado acrescenta os componentes dos kits completos Omniturbo e Omnidual; o Sóbrio não usa emojis. A prévia nas preferências usa dados de exemplo.

Habilitar proposta em PDF adiciona um botão abaixo de Copiar mensagem. Revise os campos opcionais e clique em Visualizar PDF; depois, Baixar PDF. Produtos, quantidades, preços editados, acréscimo, desconto, entrada, mensalidade e condições selecionadas vêm do orçamento. Para alterá-los, feche a proposta e edite a composição. Alterar os campos da proposta invalida a prévia anterior.

Cliente vazio ou composto apenas por espaços omite completamente a seção. Validade é opcional e não pode anteceder a emissão. A emissão aparece no canto superior direito, junto à validade quando informada. O checkbox Incluir responsável comercial vem desmarcado. Ao habilitá-lo, nome e contato são preenchidos pelo perfil e podem ser ajustados; desmarcado, toda a seção é omitida, inclusive o nome nos metadados de autoria. Esses ajustes não alteram o cadastro do cliente nem o perfil.

## Regras

- Componentes somente na mensagem Detalhada, identificados pelos IDs estáveis `prod-1` e `prod-2`; variantes e acessórios não recebem a lista por semelhança de nome.
- Omniturbo: módulo com dois chips, antena satélite, teclado, botão de pânico, sensor de painel, sensor na porta carona e motorista, bloqueador e sirene.
- Omnidual: mesmos componentes, exceto antena satélite.
- O total de equipamentos é apresentado antes de deduzir a entrada; saldo após entrada aparece separadamente. As alternativas de pagamento usam esse saldo. Mensalidade permanece separada.
- A4 com texto selecionável, logo oficial enquadrada sem slogan, benefícios e paginação automática. O exemplo aprovado cabe em uma página; muitos produtos/observações podem gerar mais páginas.

## Implementação

Preferências em `auth.user_metadata.quote_preferences`, por usuário, com defaults `{ model: 'basic', pdfEnabled: false }`. Metadados são apenas preferências de apresentação, nunca permissões. Atualização pela sessão autenticada com `auth.updateUser`; sem migração de banco.

`quotePresentation.ts` fornece os modelos e o snapshot compartilhado. `ProposalDialog` carrega dinamicamente `ProposalDocument` e `@react-pdf/renderer` apenas quando necessário. PDF gerado no navegador, sem IA, serviço de geração ou envio dos dados do cliente. URLs temporárias são revogadas ao editar/fechar. Não há arquivo de propostas no servidor nem numeração comercial persistente nesta versão.

Logo original em `public/brand/omnilink-original.png`; `objectFit: cover` e posicionamento superior excluem o slogan na renderização, preservando o arquivo original. A prévia depende do visualizador PDF do navegador; download disponível como alternativa.

## Verificação reproduzível

- `npm test`: modelos, defaults, componentes exclusivos e valores, além das regressões existentes.
- `node tests/proposal-pdf.mjs`: PDFs de exemplo, cliente vazio e proposta longa em `/tmp/proposal-validation`; renderizar com Poppler e conferir texto/paginação.
- `tests/proposal-browser.cjs`: preferências, falha/repetição, persistência, mensagem detalhada, geração/download real, invalidação de prévia e responsividade. Usa Playwright e transporte Supabase simulado, sem gravação em produção.
