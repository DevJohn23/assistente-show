# Reestruturação visual — briefing e estrutura inicial

Versão 0.1 · 10/10/2026 · Etapa de planejamento

Este documento reúne as decisões do usuário e a proposta inicial de experiência. As medidas, composições e escolhas estéticas abaixo são hipóteses para os primeiros desenhos. Não representam uma implementação nem um layout já validado.

## 1. Diretrizes confirmadas

- O computador é o principal dispositivo de uso.
- Produtos/Orçamento é a área mais utilizada; Comissões também tem alta prioridade.
- O objetivo é melhorar apresentação, consistência, legibilidade e eficiência do trabalho.
- A evolução ocorrerá por etapas, começando pela base visual e pelos fluxos prioritários.
- Esta etapa é somente de planejamento, sem alterações no código da aplicação.
- O PRD é uma referência inicial. Orçamento Inteligente permanece desabilitado.
- Recursos adicionais, como histórico de propostas, PDF e sincronização de rascunhos, ficam para uma etapa futura.

Ordem de desenho: estrutura compartilhada → Produtos/Orçamento → Comissões → Dashboard → demais telas. Login e estados de carregamento recebem a mesma identidade, sem se tornarem o foco inicial.

## 2. Direção visual proposta

Uma ferramenta comercial sóbria, com informações fáceis de comparar e controles confortáveis para uso prolongado. A personalidade vem da marca, da composição e da qualidade dos detalhes.

| Elemento | Proposta inicial |
|---|---|
| Marca | Identificação Omnilink/Show consistente; substituir o símbolo genérico por uma assinatura adequada aos materiais de marca disponíveis |
| Cor principal | Azul, usado para ações principais, seleção e foco |
| Cores de situação | Verde para confirmação; âmbar para atenção; vermelho para erro e ações destrutivas, acompanhados de texto |
| Tema claro | Fundo cinza suave, superfícies brancas, texto grafite |
| Tema escuro | Fundo grafite, superfícies discretamente elevadas e contraste de texto verificado |
| Tipografia | Uma família principal; texto operacional de 14–16 px, títulos de página de 24–28 px como ponto de partida |
| Números | Algarismos de largura uniforme; valores monetários alinhados à direita; formato brasileiro consistente |
| Espaçamento | Escala comum de 4, 8, 12, 16, 24 e 32 px |
| Controles | Altura inicial de 40 px no desktop; áreas de toque confortáveis no celular |
| Cantos e profundidade | Raios moderados, divisórias sutis e sombras reservadas para elementos sobrepostos |
| Movimento | Transições curtas, respeitando a preferência por movimento reduzido |

A paleta exata e a fonte serão escolhidas no desenho visual. Os dois temas preservarão a preferência atual do usuário. Não haverá seletor de densidade nesta primeira etapa; vamos validar uma densidade padrão confortável.

## 3. Estrutura para computador

O desenho terá como referência inicial um notebook de 1366 × 768 pixels de área de visualização, verificando também 1280 × 720, 1440 × 900 e monitores maiores. Essas dimensões são cenários de teste, não informação confirmada sobre os equipamentos da equipe.

- Navegação lateral com nomes visíveis e recolhimento por botão. Largura inicial a explorar: 208–224 px. Evitar expansão automática ao passar o mouse.
- Cabeçalho compacto: título, contexto e ações da página, sem repetir a mesma informação em um banner abaixo.
- Ordem proposta no menu: Início, Orçamentos, Comissões, Oportunidades e Rede técnica. Administração e preferências ficam separadas.
- Uso da largura disponível sem espalhar campos curtos por toda a tela.
- No orçamento, testar painel de composição de aproximadamente 380–420 px; ajustar catálogo e número de colunas ao espaço restante.
- Em notebooks menores, reduzir colunas do catálogo e reorganizar barras de ferramentas antes de reduzir fonte ou tamanho dos controles.
- Definir claramente qual região rola. Evitar uma lista de itens rolando dentro de um painel que também rola.
- Conteúdo essencial e botões continuam acessíveis com zoom, teclado e janelas menores.

## 4. Esboço de Produtos/Orçamento

| Faixa | Catálogo — área flexível | Composição — painel lateral |
|---|---|---|
| Cabeçalho da página | Orçamentos e contexto curto | Acesso identificado ao simulador de financiamento |
| Ferramentas | Busca ampla, categorias e kits salvos | Nome do cliente |
| Trabalho principal | Produtos com nome, imagem padronizada, preço, mensalidade e ação de adicionar | Itens, quantidades, preço unitário editável e remoção |
| Condições | Catálogo permanece disponível | Ajustes de preço e formas de pagamento agrupados |
| Rodapé do painel | — | Total de equipamentos, mensalidade separada e ação de copiar mensagem |

### Comportamentos prioritários

1. Encontrar produtos por busca ou categoria, com indicação clara dos filtros ativos e opção de limpar.
2. Adicionar um item sem perder busca ou posição. Mostrar quantidade selecionada e permitir adicionar mais unidades.
3. Editar preço por um controle identificável; não depender de descobrir que o número é clicável.
4. Manter acréscimo e desconto fáceis de encontrar. Quando aplicados, mostrar percentual e efeito em reais no resumo.
5. Agrupar as condições de pagamento e preservar a seleção de alternativas que podem coexistir na mensagem atual.
6. Diferenciar total de equipamentos e cobrança mensal. Preservar regras, cálculos e limites comerciais existentes.
7. Manter “Copiar mensagem” disponível no rodapé; opções secundárias, como salvar kit e limpar, não competem com essa ação.
8. Mostrar a mensagem para conferência em uma expansão ou painel acessível, sem exigir uma etapa adicional a cada cópia.
9. Após copiar, confirmar apenas a cópia. Não apresentar o orçamento como enviado.
10. Tratar orçamento vazio, busca sem resultados e falha de carregamento como estados diferentes.

Os cartões darão mais espaço ao nome e aos valores. As imagens promocionais atuais podem permanecer durante a transição; fotos limpas e padronizadas serão uma melhoria de conteúdo, condicionada à disponibilidade dos materiais. Informações comerciais essenciais devem existir como texto legível na interface.

Neste primeiro desenho, priorizar a grade de produtos. Uma alternativa em lista compacta pode ser avaliada depois de testar a grade, sem criar duas experiências completas de imediato.

### Cenários para validar o desenho

- Montar um orçamento com três produtos, incluindo duas unidades de um deles.
- Alterar preço unitário, aplicar desconto e identificar o efeito no total.
- Incluir condições de pagamento, conferir a mensalidade e copiar a proposta.
- Carregar um kit existente e ajustar seus itens.
- Trabalhar com muitos itens sem esconder o total nem tornar inacessíveis os controles.
- Distinguir “limpar orçamento” de “remover um item”.

## 5. Esboço de Comissões

| Faixa | Conteúdo |
|---|---|
| Cabeçalho | Comissões, período em destaque e ação “Cadastrar venda” |
| Resumo compacto | Comissão prevista bruta, a receber, a repassar e saldo líquido, com explicação curta |
| Ferramentas | Busca, período, filtros ativos, limpar filtros e exportação Excel |
| Área principal | Tabela com cliente, operação/vendedor, data, valor da venda, comissão e ações |
| Rodapé | Quantidade de registros, paginação e indicação do conjunto exibido |
| Edição | Painel lateral de cadastro/edição, mantendo o contexto da lista |

### Comportamentos prioritários

1. Dar destaque à tabela e ao lançamento, com resumo financeiro de altura moderada.
2. Mostrar o período consultado sem ambiguidade e oferecer atalhos de período, mantendo acesso às datas personalizadas e a todos os registros.
3. Indicar quando busca ou outros filtros também afetam os totais. Separar claramente resumo dos registros filtrados e paginação.
4. Preservar o significado e os cálculos atuais de operações próprias, a receber e a repassar. Melhorar rótulos explicativos sem reinterpretar as regras.
5. Manter valores alinhados e datas em formato brasileiro. Observações longas abrem em detalhe, sem alargar excessivamente a tabela.
6. No cadastro, apresentar primeiro o tipo de operação; exibir os campos correspondentes e manter “Salvar” acessível.
7. Preservar preenchimento em falhas, informar os erros perto dos campos e indicar salvamento em andamento.
8. Diferenciar estado sem registros de estado sem resultados para os filtros.
9. Na exportação, deixar claro qual período e conjunto de registros serão incluídos, preservando o comportamento atual de exportar o conjunto filtrado.

Não introduzir conciliação financeira, novos estados de pagamento ou novos cálculos nesta reformulação. O texto “saldo líquido” precisa de explicação coerente com o cálculo atual, sem sugerir saldo bancário ou recebimento confirmado.

### Cenários para validar o desenho

- Cadastrar uma venda própria.
- Registrar cada modalidade de implantação e identificar a pessoa envolvida.
- Consultar um mês específico e entender a composição dos totais.
- Encontrar um cliente, editar valor ou observação e retornar ao mesmo contexto.
- Exportar os registros filtrados, incluindo os que não estão na página visível.
- Ler clientes e observações com nomes longos sem perder os valores e ações.

## 6. Componentes e estados compartilhados

| Componente | Estados e comportamentos a desenhar |
|---|---|
| Botão | Normal, foco, hover, desabilitado e ação em andamento; hierarquia principal/secundária/destrutiva |
| Campo | Rótulo permanente, preenchido, foco, erro e ajuda contextual; máscara que permita corrigir o valor |
| Busca e filtros | Valor ativo, limpar, resultados encontrados e nenhum resultado |
| Tabela | Carregamento, preenchida, vazia, erro, paginação e edição de registro |
| Painel de edição | Abrir, percorrer por teclado, salvar, falhar e fechar; retorno do foco ao acionador |
| Confirmação | Objeto da ação identificado e consequência explícita; ação duplicada bloqueada |
| Feedback | Sucesso breve; falha persistente enquanto exigir ação; nenhuma confirmação anterior à persistência |
| Carregamento | Estrutura proporcional ao conteúdo, sem números fictícios ou simulação de progresso |

Usar a [WCAG 2.2](https://www.w3.org/TR/WCAG22/) como referência de acessibilidade, verificando contraste, foco, navegação por teclado, nomes acessíveis e adaptação do conteúdo. A seleção de opções secundárias segue o princípio de [revelar detalhes sob demanda](https://www.nngroup.com/articles/progressive-disclosure/), preservando controles frequentes na área principal.

## 7. Adaptação para celular

A prioridade do desktop orienta a primeira composição; o celular terá uma reorganização adequada aos mesmos fluxos.

- Orçamento: catálogo com controles confortáveis e resumo inferior que abre a composição em tela inteira.
- Comissões: resumo compacto, filtros acessíveis e registros com prioridade para cliente, data e comissão; demais dados em detalhe.
- Formulários: campos e ações acessíveis com teclado virtual aberto.
- Menus e edições: nenhuma ação essencial depende de hover.

## 8. Entregáveis e sequência

| Etapa | Resultado | Critério para avançar |
|---|---|---|
| A — Briefing e estrutura | Este documento, prioridades e esboços de organização | Fluxos e prioridades suficientemente definidos para desenhar |
| B — Proposta visual | Orçamento e Comissões em desktop, com variantes clara/escura e estados principais | Comparação visual e revisão dos cenários de trabalho |
| C — Consolidação | Guia de componentes e adaptação para celular; alinhamento do login e navegação | Comportamentos consistentes e pontos de fricção resolvidos |
| D — Implementação futura | Aplicação gradual dos padrões e validação de regressões | Fluxos existentes preservados e critérios de uso atendidos |

O próximo passo é desenhar a proposta visual de Produtos/Orçamento, seguida de Comissões, usando registros representativos sem expor dados pessoais. Os desenhos devem incluir conteúdo suficiente para avaliar a densidade real, em vez de telas quase vazias.

Ao revisar, comparar o tempo e os erros nas tarefas com a interface atual. A meta inicial é manter ou reduzir o esforço nos fluxos frequentes, melhorar a identificação de valores e evitar perda de contexto. Não há meta numérica definida antes de observar a execução dessas tarefas.
