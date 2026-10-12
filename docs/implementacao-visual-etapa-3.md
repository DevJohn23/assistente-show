# Implementação visual — etapa 3: Comissões

11/10/2026. Alterações locais, sem publicação na Vercel.

## Interface e experiência

- Cabeçalho próprio, com ação principal Cadastrar Venda.
- Quatro indicadores compactos: comissão prevista bruta, a receber, a repassar e saldo líquido previsto. Os valores seguem os filtros, sem sugerir pagamento confirmado.
- Busca por cliente, vendedor e notas; datas personalizadas; atalhos de mês atual/anterior; filtro por operação e limpeza conjunta.
- Tabela com data brasileira, valores alinhados, operação e parceiro junto ao cliente, notas em diálogo e ações identificadas para teclado e leitores de tela.
- Paginação com contagem visível e ajuste à última página disponível após exclusão. Exportação continua incluindo todo o conjunto filtrado.
- Detalhamento por vendedor expansível.
- Cadastro e edição em modal centralizado com fundo desfocado, operação primeiro, parceiro contextual, corpo rolável e ações fixas. Campos preservados após falha, confirmação somente após persistência.
- Notas e exclusão usam diálogos do mesmo padrão visual. Exclusão identifica o cliente e mantém a confirmação aberta em caso de falha.
- Em celular, linhas tornam-se cartões; os temas claro/escuro usam as cores compartilhadas.

## Regras preservadas

Cálculos, agrupamento por vendedor e função de exportação comparados integralmente com o código anterior. Bruta = próprias + repasses + recebimentos. Líquida prevista = bruta - repasses. Nenhum estado de pagamento ou conciliação foi introduzido.

## Validação

Testes de navegador com Supabase simulado, sem gravações reais. A suíte específica cobre totais, filtros, paginação, conteúdo do Excel além da página visível, edição/notas, modalidades de parceiros, exclusão com falha e nova tentativa, telas menores, tema escuro e erros de execução. A suíte geral confere dashboard, navegação, persistência e demais recursos existentes.

Resultado final: TypeScript, build de produção e ambas as suítes de navegador passaram. Capturas conferidas em desktop, modal de edição, tema escuro e celular.

## Refinamento após revisão

Cadastro/edição centralizados com largura de até 640px, fundo desfocado, corpo rolável e rodapé fixo. Filtros e tabela passam a ter superfícies independentes com 20px de intervalo. Removida a legenda redundante de período/quantidade/exportação; a contagem permanece na paginação e o escopo da exportação no título do botão.
