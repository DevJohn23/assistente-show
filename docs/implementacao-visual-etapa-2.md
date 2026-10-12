# Implementação visual — etapa 2: Produtos/Orçamento

11/10/2026. Implementação e testes no localhost. Sem publicação na Vercel nesta etapa.

## Interface

- Cabeçalho, busca, filtros de categoria, kits, cartões e botões seguem a base visual da primeira etapa.
- Imagens reais são preservadas e exibidas sem recorte. Uma identificação neutra aparece quando a imagem não existe ou falha ao carregar.
- Painel lateral recolhível, com preferência salva e faixa compacta para reabrir, exibindo quantidade e total. Recolher não limpa os dados preenchidos.
- No celular (até 640px), a composição abre em tela inteira. Em janelas intermediárias, abre em modal centralizado de até 620px, com fundo desfocado; em desktop largo, permanece no painel lateral. Desktop e celular compartilham a mesma apresentação e o mesmo estado.
- Cliente, quantidades, edição de preço, restauração do preço de catálogo, acréscimo e desconto permanecem disponíveis.
- Mensalidade, entrada de R$ 550, Pix, boleto, cartão e financiamento foram preservados. Parcelas de financiamento podem ser selecionadas em conjunto.
- O resumo mantém equipamentos e mensalidade separados; quando há entrada, exibe também o saldo após a entrada.
- Prévia da mensagem, cópia com confirmação real, limpeza com confirmação e gerenciamento de kits em diálogos com suporte a Escape e foco.
- Controle de quantidade por clique, teclado, toque e pressão prolongada.
- O Orçamento Inteligente continua desabilitado.

## Preservação das regras e correções relacionadas

A tabela de fatores, a função de financiamento e a função que monta o texto comercial foram comparadas com a versão anterior à etapa e preservadas integralmente. A simulação exibida no painel agora usa o mesmo saldo após entrada utilizado pela mensagem, eliminando uma divergência prévia de apresentação.

A entrada não pode gerar uma proposta negativa: se superar o valor dos equipamentos, a interface pede o ajuste e impede a cópia. Nenhum novo valor de entrada foi definido.

O simulador aceita a escrita brasileira com separador de milhar, como `6.930,00`, além do formato numérico já aceito. Não foram alterados os fatores ou os juros dos cálculos existentes.

A cópia aguarda a confirmação da área de transferência e mostra falha quando necessário. Adicionar um produto pelos detalhes aumenta sua quantidade, em vez de alternar a remoção de um produto já selecionado.

## Testes

Resultado: TypeScript, build de produção e as duas suítes de navegador passaram. Layout conferido em desktop, celular e tema escuro; nenhuma exceção de página nos testes.

- `tests/catalog-browser.cjs`: interação real com a interface usando dados e transporte Supabase simulados. Verifica busca sem acentos, categorias, quantidades, preço manual, desconto, acréscimo, entrada, pagamentos, parcelas, prévia, clipboard, recolhimento, persistência, kits, celular e tema escuro.
- Cenário numérico de referência: duas unidades de R$ 900 e um acessório de R$ 250, acréscimo de 10% e desconto de 10% produzem R$ 2.029,50 em equipamentos. Com entrada de R$ 550, o saldo é R$ 1.479,50. A mensagem e o painel são conferidos com esse cenário.
- `tests/browser-regressions.cjs`: regressões da dashboard, navegação, temas, comissões, oportunidades, salvamento de kits, falhas de leitura e saída.
- Os testes não gravam dados de produção. O localhost usado manualmente continua conectado ao Supabase configurado no projeto.

## Próximo passo

Redesenhar Comissões com a mesma base, mantendo seus cálculos, lançamentos, filtros, exportação e operações por vendedor. Edição de perfil/senha permanece em etapa própria.

## Refinamento após revisão do usuário — 11/10/2026

Detalhes do produto e simulador redesenhados com os mesmos componentes visuais, tipografia, cores e ações da aplicação. Diálogos recebem fundo desfocado. Acréscimo e desconto usam incrementos de 1 ponto percentual; valor unitário usa R$ 1. Digitação decimal permanece disponível. TypeScript e testes de navegador do orçamento passaram, incluindo incrementos pelo teclado, preço com centavos e dimensões do modal em notebook.

## Refinamento do catálogo — 12/10/2026

- Zoom de 4% somente na imagem ao passar o mouse, recortado pelo contêiner e desativado com movimento reduzido.
- Botão Adicionar com fundo/borda azuis discretos e realce de hover/foco nos dois temas.
- Mensalidade dos cartões em verde discreto; preço principal e controle de quantidade preservados.
- Mudança apenas visual, sem alteração de cálculos, carrinho ou condições comerciais.

### Imagens no topo dos cartões — 12/10/2026

- Cartões verticais com imagem horizontal no topo: 140px de altura no desktop e 130px no celular, preservando proporção sem cortar o produto.
- Espaço mínimo de duas linhas para nomes e área de preço/mensalidade padronizada; ações alinhadas na base.
- Zoom leve, botão azul e mensalidade verde mantidos. Somente CSS; dados e regras comerciais preservados.

### Confirmação de produto adicionado — 12/10/2026

- Cartões mostram Adicionar ou ✓ Adicionado, com fundo/contorno verdes discretos após selecionar.
- Estado confirmado não adiciona nem remove unidades; aria-disabled comunica indisponibilidade sem perder o foco após clique.
- Quantidade permanece no painel do orçamento. Remoção/limpeza do carrinho restaura Adicionar automaticamente.
- Transição de cores e entrada suave do check respeitam movimento reduzido.

### Mais área útil no orçamento — 12/10/2026

- Subtítulo redundante removido. No desktop, painel alinhado à linha do título e altura da janela menos 52px, com margem inferior.
- Cabeçalho, rodapé e estado vazio compactados; totais e ações permanecem fixos, lista central rolável.
- Layout recolhido e modal em telas menores preservados. Captura desktop revisada e checagem TypeScript aprovada.

### Topo compacto — 12/10/2026

- Título mantido apenas para leitores de tela.
- Busca e Simular financiamento na primeira linha, alinhados ao topo do orçamento.
- Filtros e Kits salvos na segunda linha; simulação ocupa linha própria no celular.
- Altura ampliada do painel e estados recolhido/modal preservados.

### Rodapé sem prévia — 12/10/2026

- Botão e modal de prévia removidos em desktop e mobile; rodapé mantém totais e cópia direta da mensagem.
- Mensagem de falha de cópia atualizada para não apontar à prévia removida.
- Testes passam a validar o texto efetivamente copiado e sua falha/repetição, inclusive no celular.
- Mobile: acesso ao orçamento em barra superior, busca em largura total, simulação na linha seguinte, filtros e kits com quebra de linha e cartões em coluna única.
