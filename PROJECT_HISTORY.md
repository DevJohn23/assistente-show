# 📌 Histórico de Progresso & Changelog — Assistente Show

Este documento mantém o histórico oficial de atualizações, funcionalidades comitadas e estado do projeto **Assistente Show** (Show Tecnologia • Omnilink).

---

## Configuração da Vercel confirmada — 12/10/2026

- Reconexão resolveu o acesso ao projeto `assistente-show-qymy` e aos deployments.
- Metadados confirmam URL/chave pública do Supabase, chave de serviço e Resend cadastradas em produção; valores não foram descriptografados nem validados por chamadas reais.
- `CRON_SECRET` estava ausente. Criado segredo aleatório de 256 bits, como variável sensível exclusiva de produção, e existência confirmada por nova consulta. Nenhum valor registrado no projeto.
- Configuração passa a valer em novo deployment; produção existente ainda usa código/configuração anteriores. Nenhum deploy ou disparo de e-mail realizado.
- Continua pendente o resultado do teste real de recuperação de senha pelo usuário e a homologação das integrações antes da publicação definitiva.

---

## Correções da revisão final — 12/10/2026

- Cron sem segredo fixo, sem autenticação por query string e sem fallback para chave pública/destinatário alternativo; exige autorização em todos os ambientes e configuração válida antes de executar.
- Rascunhos de orçamento isolados por conta; legado sem dono descartado; kits preservados. Troca de usuário remonta o catálogo.
- Corrigido feedback prematuro em submissão duplicada de comissão.
- TypeScript, build, testes Node e quatro suítes de navegador afetadas aprovados. Novos testes de segurança do cron e isolamento entre contas.
- Servidor local atualizado na porta 3000. Sem deploy. Configuração/rotação do segredo na Vercel depende de acesso à equipe (403); usuário fará o teste real de recuperação de senha.
- Detalhes atualizados em `docs/revisao-final-pre-deploy.md`.

---

## Revisão final antes da publicação — 12/10/2026

- Build de produção, testes Node, verificação de diff e sete suítes de navegador aprovados contra o build local. Serviços externos simulados nos testes de navegador; nenhuma escrita de dados reais nesta revisão.
- Reestruturação visual implementada; produção ainda condicionada à revisão do segredo fixo do cron, recuperação real de senha e configuração/acesso da Vercel (listagem de deployments retornou 403).
- Identificados rascunho de orçamento sem isolamento por usuário no navegador e detalhe de feedback em envio duplicado de comissões. Registrados para correção.
- Inspeção somente leitura das políticas do Supabase; aviso de proteção contra senhas vazadas desativada.
- Nenhum deploy, commit ou push. Localhost em modo de produção local (`next start`) para homologação. Relatório: `docs/revisao-final-pre-deploy.md`.

---

## Administração: reestruturação visual local — 12/10/2026

- Produtos e técnicos alinhados ao padrão visual; busca separada, tabelas e modais centralizados com foco/Escape.
- Confirmação de exclusão e feedback de erro/sucesso na interface; proteção contra duplicidade e resposta de registro exigida nas escritas.
- Localização e categorias existentes preservadas; endereço obrigatório para novo técnico; autocomplete Photon cancelável.
- Acesso direto sem administrador verificado por teste de interface, sem mudança nas políticas remotas.
- TypeScript, build, regressões Node, suíte específica da Administração e suíte geral de navegador aprovados com dados simulados.
- Apenas localhost. Recuperação real de senha e URLs de retorno continuam pendentes. Detalhes em `docs/implementacao-visual-etapa-7.md`.

---

## Rede técnica: sugestões e pinos — 12/10/2026

- Autocomplete via Photon com pausa, cache, cancelamento e teclado; busca explícita preservada.
- Retorno de marcadores em formato de pino, mantendo numeração e categoria. Mapa à direita.
- TypeScript e testes de navegador da Rede técnica aprovados; consulta real de endereço público no Photon confirmada. Sem publicação ou gravação de dados.

---

## Rede técnica: atualização visual local — 11/10/2026

- Busca por endereço/CEP ou técnico sempre disponível; filtro por categoria antes dos cinco mais próximos.
- Lista e mapa sincronizados, distância em linha reta, selo Mais próximo, contatos e rotas diretos.
- Estados de carregamento, erro/repetição e localização aproximada por cidade; cancelamento de consultas antigas.
- Layout consistente com as etapas anteriores, temas e celular; inicialização/redimensionamento do mapa revisados.
- TypeScript, build, regressões gerais e testes específicos de navegador aprovados com respostas simuladas; zero gravações reais.
- Somente localhost. Detalhes: `docs/implementacao-visual-etapa-6.md`.

---

## Oportunidades: atualização visual local — 11/10/2026

- Filtros separados dos registros; tabela com datas brasileiras, situações claras e ações acessíveis.
- Cadastro/edição em modal centralizado; notas, renovação e exclusão no mesmo padrão.
- Grade de cartões denominada Por vencimento e ordenada por data; adaptação para celular e temas claro/escuro.
- Regras de cadastro PF/PJ, renovação a partir do vencimento atual, filtros e exportação preservados. Nenhuma nova operação comercial adicionada.
- Ajuste no feedback de envio duplicado e no preenchimento de data vazia.
- TypeScript, build, testes gerais e específicos de Oportunidades aprovados com dados simulados.
- Somente localhost. Detalhes: `docs/implementacao-visual-etapa-5.md`.

---

## Conta e acesso: implementação local — 11/10/2026

- Avatar/nome: Minha conta em modal centralizado com Dados pessoais e Senha. Tema e saída mantidos no menu.
- Nome atualizado pelo Supabase Auth; senha atual confirmada antes da troca. Permissões e registros comerciais preservados.
- Login/cadastro redesenhados, campo mostrar/ocultar senha, confirmação de nova senha e recuperação por e-mail.
- Nova rota `/recuperar-senha`, tratamento de links inválidos/expirados, atualização da página e recebimento do callback na raiz ou na mesma aba.
- TypeScript, build de produção, testes de conta/autenticação e suíte geral de regressões com chamadas simuladas passaram. Nenhuma conta, senha ou e-mail real usado nos testes.
- **Pendente externo:** confirmar URLs autorizadas e entrega/abertura de e-mail real. O painel Supabase exige login no navegador e o plugin não expõe essa configuração. Sem publicação na Vercel ou alterações remotas nesta etapa.
- Detalhes: `docs/implementacao-visual-etapa-4.md`.

---

## Comissões: atualização visual local — 11/10/2026

- Validação técnica: TypeScript e build de produção concluídos com sucesso.
- Terceira etapa: resumo financeiro compacto, tabela padronizada, operações junto ao cliente, valores alinhados e datas brasileiras.
- Filtros de busca, período e operação, atalhos de mês, limpeza e exportação do conjunto filtrado. Paginação ajustada após exclusões.
- Cadastro/edição em modal centralizado (ajustado após revisão do usuário), filtros separados da tabela e legenda redundante removida. Operação primeiro, parceiro contextual e ações fixas. Notas e confirmação de exclusão em diálogos consistentes, com erro visível e preservação de dados.
- Detalhamento por vendedor expansível; adaptação para celular e tema escuro.
- Cálculos, agrupamento por vendedor e função de exportação comparados integralmente com a versão anterior e preservados.
- Testes de navegador gerais e específicos passaram com dados simulados, incluindo leitura do Excel, modalidades de parceiro e recuperação após falhas. Sem gravações de teste em produção ou publicação na Vercel.
- Detalhes: `docs/implementacao-visual-etapa-3.md`.

---

## Produtos/Orçamento: atualização visual local — 11/10/2026

- **Refinamento solicitado pelo usuário:** detalhes de produto e simulador padronizados; orçamento centralizado em janelas intermediárias com fundo desfocado, tela inteira somente no celular; incrementos de 1% e R$ 1 com digitação decimal preservada.
- **Segunda etapa:** catálogo com busca/categorias, cartões padronizados, painel recolhível e composição compartilhada entre desktop e celular.
- **Preservados:** kits, cliente, quantidades, preço manual, acréscimo/desconto, mensalidade, entrada, Pix, boleto, cartão, financiamento e simulador.
- **Ajustes de confiabilidade:** confirmação real da cópia, prévia de parcelas com entrada consistente com a mensagem, leitura de moeda brasileira e bloqueio de proposta com saldo negativo após entrada.
- **Regras:** fatores de financiamento e função do texto comercial comparados e preservados integralmente. Orçamento Inteligente segue desabilitado.
- **Ambiente:** somente localhost; sem publicação nesta etapa. Testes com dados simulados.
- **Validação:** TypeScript, build de produção e suítes de navegador de orçamento e regressões passaram. Layout conferido em desktop, celular e tema escuro.
- **Detalhes:** `docs/implementacao-visual-etapa-2.md`. Próxima etapa: Comissões.

---

## Implementação visual local — 11/10/2026

- **Primeira etapa:** base visual, menu recolhível com preferência salva, seleção de tema pelo perfil e dashboard simplificada conforme os desenhos revisados.
- **Navegação:** indicadores abrem listas filtradas; três ações principais em formato de botão. Sem próximos vencimentos ou gráfico semanal.
- **Ambiente:** alterações apenas locais nesta etapa. Acesso manual ao localhost usa o Supabase configurado; testes de navegador usam respostas simuladas.
- **Continuidade:** Produtos/Orçamento e Comissões recebem o redesenho nas próximas etapas. Entrada e financiamento serão preservados no orçamento; perfil/senha têm etapa própria.
- **Validação:** TypeScript, build, 14 testes de regressão e testes de navegador com Supabase simulado passaram. Layout conferido em notebook, celular e tema escuro.
- **Detalhes:** `docs/implementacao-visual-etapa-1.md`.

---

## Planejamento visual — 10/10/2026

- **Etapa atual:** briefing e estrutura inicial; nenhuma alteração visual implementada nesta etapa.
- **Decisões do usuário:** uso principalmente no computador; Produtos/Orçamento é a maior prioridade, seguido de Comissões. Recursos adicionais ficam para o futuro.
- **Documento:** `docs/planejamento-visual.md` reúne a direção proposta, os esboços de organização, os estados compartilhados e os cenários de validação.
- **Próximo passo:** proposta visual de Orçamento e Comissões para desktop, seguida de consolidação dos componentes e adaptação para celular. Medidas e escolhas estéticas ainda são propostas para revisão.

---

## Correções de confiabilidade — 10/10/2026

- **Supabase aplicado:** migração `restrict_product_image_management_to_admins`; gestão de imagens restrita a administradores autenticados. URLs públicas preservadas; quatro cenários de autorização conferidos.
- **Aplicação preparada para PR:** salvamento confirmado pelo banco, falhas visíveis com formulários preservados, bloqueio de submissões repetidas, remoção de dados fictícios em falhas de leitura e dashboard limitado ao mês/ano atuais.
- **Validação:** TypeScript, build de produção, 14 testes de regressão e fluxos de navegador com Supabase simulado passaram.
- **Decisão do usuário:** PRD é referência inicial; Orçamento Inteligente permanece desabilitado.
- **PR:** https://github.com/DevJohn23/assistente-show/pull/1 (rascunho), commit `d0551b2`, branch `codex/corrigir-persistencia-dashboard-imagens`.
- **Publicação:** frontend ainda não incorporado à `main` nem publicado em produção. Detalhes em `docs/correcoes-2026-10-10.md`.

---

## 🚀 Informações Gerais do Projeto

- **Nome do Projeto**: Assistente Show
- **Organização**: Show Tecnologia • Omnilink
- **Tecnologias**: Next.js 14 (App Router), React, TypeScript, TailwindCSS, Supabase (PostgreSQL), Resend API, Vercel Cron.
- **Link de Produção (Vercel)**: [https://assistente-show-qymy.vercel.app](https://assistente-show-qymy.vercel.app)
- **Repositório GitHub**: [https://github.com/DevJohn23/assistente-show.git](https://github.com/DevJohn23/assistente-show.git)
- **Estado Atual**: 100% Funcional e Sincronizado em Produção (`main`).
- **Nome Atual do Sistema**: Assistente Omnilink (renomeado em Out/2026).

---

## 📍 Ponto de Parada Atual
- **Último Commit**: `fd8f2ca` — `style: atualiza placeholder do campo de nome do cliente` (05/10/2026)
- **Descrição**: O sistema foi renomeado para **Assistente Omnilink**, com suporte completo a mobile (bottom sheet, layout responsivo, correções de z-index), tema claro/escuro, edição manual de valores no carrinho, busca aprimorada de CEP, paginação de comissões, atualização da rede de técnicos (outubro 2026) e geração de orçamento com suporte a acréscimo/desconto no mobile.

---

## 📜 Histórico de Commits e Funcionalidades (Linha do Tempo)

### 🟢 `fd8f2ca` — Renomeação para Assistente Omnilink + Melhorias Mobile (Out/2026)
- **Renomeação do Sistema** (`c8d006b`, 03/10): Aplicação renomeada de "Assistente Show" para **"Assistente Omnilink"** em toda a UI. Logo agora funciona como link clicável.
- **Atualização da Rede Técnica** (`b47aec2`, 02/10): Dados dos técnicos atualizados para a base vigente de **Outubro de 2026**.
- **Geração de Orçamento Aprimorada** (`f1f2825`, 02/10): Atualizada lógica de geração e formatação do orçamento.
- **Acréscimo e Desconto no Mobile** (`4cbe68b`, 02/10): Corrigido bug que impedia a exibição dos campos de acréscimo (%) e desconto (%) no painel de orçamento em dispositivos móveis.
- **Correção Z-index Menu Mobile** (`c88cfef`, 03/10): Corrigido z-index do menu de navegação mobile para sobrepor corretamente o mapa da rede de técnicos.
- **Placeholder do Campo de Nome** (`fd8f2ca`, 05/10): Atualizado o placeholder do campo de nome do cliente no orçamento.

### 🟢 `464c539` — Mobile-First + UX Completo (Set/2026)
- **Bottom Sheet Mobile para Orçamento** (`d13ad4b`, 20/09): Implementado painel de orçamento em formato *bottom sheet* deslizante para dispositivos móveis, replicando toda a funcionalidade do painel desktop em uma interface nativa de mobile.
- **Correção de Layout Mobile** (`2c13b6a`, 20/09): Corrigido layout da barra de controle (filtros/busca) no mobile para exibição adequada em telas pequenas.
- **Paginação na Lista de Comissões** (`464c539`, 20/09): Adicionada paginação na aba de comissões para melhorar performance e navegação em listas extensas de registros.
- **Busca de Endereço no Admin** (`72c837`, 20/09): Ao adicionar um novo técnico pelo Painel Administrativo, o sistema agora realiza geocoding automático do endereço fornecido para preencher as coordenadas (lat/lng) automaticamente.

### 🟢 `aa6b789` — Melhorias de UX e Qualidade de Vida (Set/2026)
- **Melhorias de Layout no Catálogo** (`aa6b789`, 19/09): Refinamentos visuais na grade de produtos do catálogo para melhor aproveitamento de espaço e legibilidade.
- **Ajustes no Orçamento** (`18ff799`, 19/09): Revisados labels e a formatação da mensagem gerada para WhatsApp, melhorando clareza e organização do texto copiável.
- **Correção de Bug — Fuso Horário nas Datas** (`3a16bd9`, 07/09): Corrigido bug crítico onde datas de oportunidades e comissões podiam ser exibidas com 1 dia de diferença devido à conversão UTC/BRT sem offset correto.
- **Botão X para Limpar Busca** (`a72fbaf`, 07/09): Adicionado ícone de X no campo de busca do catálogo e mapa de técnicos para limpar o texto digitado com 1 clique.
- **Tema Claro/Escuro** (`1a36f97`, 06/09): Implementado toggle de tema claro/escuro com persistência via `localStorage`. A preferência do sistema operacional é detectada automaticamente na primeira visita.

### 🟢 `865860b` — Edição Manual de Valores + Fallback de CEP (Set/2026)
- **Edição Manual de Valores no Carrinho** (`865860b`, 02/09): Adicionada a possibilidade de editar manualmente o valor unitário de qualquer equipamento diretamente no carrinho do orçamento, sem precisar acessar o Painel Administrativo.
- **Fallback de Busca de CEP no Nominatim** (`4e18d35`, 01/09): Aprimorado o geocoding de CEP: quando a busca via ViaCEP + Nominatim falha, o sistema tenta automaticamente uma segunda estratégia de query para garantir a localização do endereço.

### 🟢 `792ed9c` — Correções no Admin + Orçamento Inteligente (Ago/2026)
- **Correção na Criação de Produtos no Admin** (`792ed9c`, 30/08): Corrigido bug na criação de novos produtos pelo painel admin que causava erros de violação de RLS e conflito de ID no Supabase. Agora o ID é gerado automaticamente pelo banco e a categoria é corretamente associada.
- **Regras do Orçamento Inteligente — Monobloco** (`a16fc8d`, 30/08): Removida a sugestão automática de conexão/chicote espiral e tomada do tipo Caminhão Monobloco (esse acessório agora é sugerido apenas para Cavalo Mecânico).
- **Layout de Implementos em 1 Coluna** (`a297098`, 30/08): Alterado o layout da seleção de implementos no Orçamento Inteligente para exibição em coluna única (um abaixo do outro), melhorando legibilidade.
- **Ajustes Visuais — Implementos** (`15457ee`, 30/08): Polimento visual minimalista nos cards de implementos e refinamento fino da interface do Orçamento Inteligente.
- **Orçamento Inteligente — Seleção de Implemento** (`d983ff6`, 30/08): Adicionada seleção de tipo de implemento (baú, graneleiro, tanque, etc.) no assistente guiado. A escolha do implemento preenche automaticamente os acessórios recomendados correspondentes.
- **Buscador de Técnico Específico + Geocoding Reverso** (`60c7e07`, 29/08): Adicionado campo de busca por nome de técnico específico no mapa. Implementado geocoding reverso: ao clicar em um pino no mapa, o sistema identifica o endereço aproximado da localização do técnico.

---

### 🟢 `HEAD` — Painel Administrativo Completo + Migração para Supabase
- **Painel Admin (`/admin`)**: Nova rota protegida acessível apenas por administradores cadastrados na tabela `admin_users`. Botão de acesso aparece no Sidebar (ícone ⚙️ dourado) apenas para contas autorizadas.
- **Gestão de Produtos**: Listagem completa com busca por nome, edição inline de preço, mensalidade, descrição e imagem. Adição e exclusão de produtos diretamente pelo painel.
- **Gestão de Técnicos**: Listagem com busca multi-campo (nome, categoria, tipo, parceiro), edição de dados de contato, coordenadas e categoria. Adição e remoção de técnicos.
- **Upload de Imagens com Compressão**: Upload direto do dispositivo com redimensionamento automático (max 400px) e compressão JPEG (qualidade 70%, ~200KB). Armazenamento no Supabase Storage (bucket `product-images`). Fallback para URL manual mantido.
- **Migração de Dados para Supabase**:
  - Tabela `products`: 128+ produtos migrados do `mockData.ts` para o PostgreSQL com categorias (`cat-1`, `cat-2`), preços, mensalidades e regras comerciais.
  - Tabela `tecnicos`: 122 técnicos migrados do `tecnicos.json` para o PostgreSQL.
  - Tabela `categories`: Categorias de produtos cadastradas (`Rastreadores Omnilink`, `Acessórios & Sensores`, etc.).
  - Tabela `admin_users`: Controle de acesso administrativo por email.
- **Row Level Security (RLS)**: Políticas configuradas para leitura pública de produtos, técnicos e categorias, e acesso total (CRUD) apenas para administradores autenticados.
- **Verificação de Admin Robusta**: Checagem dupla — consulta à tabela `admin_users` no Supabase + variável de ambiente `NEXT_PUBLIC_ADMIN_EMAIL` como fallback.
- **Catálogo Dinâmico**: A página principal agora busca produtos do Supabase em tempo real. Alterações feitas no Painel Admin refletem instantaneamente no catálogo sem necessidade de deploy.

### 🟢 `HEAD` — Simulador de Parcela de Financiamento (Modal)
- **Botão Discreto**: Ícone de calculadora na barra de ferramentas do catálogo, abrindo modal sem poluir o layout.
- **Simulação Livre**: Campo de valor + seletor de parcelas (1x a 36x) com botões de incremento/decremento.
- **Cálculo em Tempo Real**: Utiliza a mesma matriz de fatores bancários oficiais para precisão absoluta.

### 🟢 `HEAD` — Integração com Google Maps (Rotas)
- **Traçar Rota Direta**: Adicionado um botão "Ver rota no Google Maps" dentro do card de detalhes de cada técnico.
- **Roteamento Inteligente**: Quando uma busca é feita (por CEP ou endereço), o sistema injeta a coordenada do cliente como ponto de partida (origem) e a coordenada do técnico como destino, abrindo o app ou site do Google Maps com a rota exata já traçada para verificar o deslocamento real.

### 🟢 `HEAD` — Busca Inteligente de Técnicos por CEP
- **Integração ViaCEP**: O campo de busca agora reconhece automaticamente quando um CEP é digitado (8 dígitos, com ou sem traço).
- **Resolução Dupla**: Ao detectar um CEP, o sistema busca o endereço completo e usa essa informação para encontrar as coordenadas exatas no Nominatim, retornando o local com precisão sem falhas de interpretação de CEP.

### 🟢 `HEAD` — Backup Semanal de Comissões Individualizado (Cron)
- **Varredura em Lote**: Endpoint do Cron Job modificado para aceitar `SUPABASE_SERVICE_ROLE_KEY` e identificar todos os usuários cadastrados via Admin API.
- **Relatórios Exclusivos**: O sistema cruza as vendas dos últimos 7 dias e gera um Excel contendo apenas as vendas pertencentes àquele usuário específico, disparando o e-mail pro endereço de cadastro.
- **Fallback de Segurança**: Mantido envio único genérico caso a chave Admin não esteja configurada.

### 🟢 `HEAD` — Opção de Entrada Mínima e Ajustes Visuais no Orçamento
- **Entrada Mínima PF**: Adicionado toggle ("Exigir Entrada PF Novo") no painel de opções do orçamento, com destaque visual e persistência de estado.
- **Inserção no WhatsApp**: Ao habilitar o toggle, o texto copiável inclui automaticamente `💵 *Entrada Mínima:* R$ 550,00` antes das formas de pagamento.
- **Limpeza do Financiamento**: Removida a tag poluente "(TAC + IOF incl.)" do texto de financiamento no WhatsApp.

### 🟢 `de987ac` — Aba Rede de Técnicos (Buscador Georreferenciado)
- **Mapa e Busca Sem Custos**: Implementado mapa via Leaflet/OpenStreetMap e Geocoding via Nominatim (dispensando API Key paga do Google Maps).
- **Lista de Técnicos (122 registros)**: Parse automatizado do KML oficial do 1º Semestre de 2026, gerando JSON padronizado com categorias, coordenadas, tipo de atuação e dados de contato.
- **Cálculo de Proximidade On-The-Fly**: Busca por endereço aplica a fórmula de Haversine no lado do cliente, listando os 5 técnicos mais próximos classificados por distância em linha reta, com destaque (⭐ Recomendado) para a opção #1.
- **Modo Duplo**: 
  - *Visão Inicial*: Mapa mostra todos os 122 técnicos coloridos por categoria. Clique em um pino revela o card na lateral.
  - *Modo Busca*: Zoom focado no endereço, exibindo apenas os 5 mais próximos como pinos Google-style numerados.
- **Contatos Expressos**: Integração com WhatsApp Web/App (`wa.me/`) ao clicar no telefone, com redirecionamento limpo.

### 🟢 `a1f26c7` — Simulação de Financiamento Perfeita (100% de Precisão)
- **Cálculo com Fatores Exatos**: Substituída a fórmula de juros simples/Price estimada por uma matriz de fatores multiplicadores (PMT e Crédito) matematicamente derivados de 36 cenários da ferramenta oficial do banco.
- **IOF Não-Linear Incorporado**: O novo método resolve as discrepâncias complexas na fórmula de IOF não-linear (teto cap) e TAC, garantindo precisão absoluta (em centavos) de 1x a 36x para qualquer valor de produto/entrada/desconto.

### 🟢 Orçamento Inteligente & Gerenciador de Kits Prontos
- **Sub-Navegação no Catálogo**: Adicionadas sub-abas no topo do catálogo para alternar entre `Catálogo Padrão` e `Orçamento Inteligente`.
- **Assistente Guiado por Veículo (`smartQuoteRules.ts` & `SmartQuoteWizard.tsx`)**:
  - Recomendação dinâmica de equipamentos, travas (folha dupla, roll-up, frigorífica), sensores e conexões/chicotes de cabine.
  - Suporte a Cavalo Mecânico (com opção de carreta baú e travas de quinta roda Fontaine/E.LOCK).
  - Cards de produtos em grade de 2 colunas com busca no topo.
- **Gerenciador de Kits Prontos**:
  - Botão de 3 pontinhos (`MoreVertical`) fixado no canto direito da barra de kits.
  - Modal interativo para renomear em tempo real e excluir kits salvos.
  - Remoção do rótulo "Kits Prontos:" para ganho de espaço em tela.
- **Melhorias Visuais no Painel do Orçamento**:
  - Busca compacta com texto "Pesquisar...".
  - Expansão do espaço de produtos do carrinho para 400px de altura (`max-h-[400px]`).
  - Adicionado rótulo de título "Produtos" e simplificado "Nome do Cliente".

### 🟢 Novo Produto Trava Digital Fontaine & Formatação Monetária Estrita (2 Casas Decimais)
- **Novo Produto (`prod-129`)**: Cadastrado `TRAVA DE QUINTA RODA DIGITAL FONTAINE + ARIETE` no valor de R$ 3.700,00 à vista / 12x R$ 369,38 no cartão, sem mensalidade.
- **Padronização de Categorias**: Agrupadas todas as travas de quinta roda (E.LOCK e Digital Fontaine) na categoria *Acessórios & Sensores* (`cat-2`).
- **Formatação Monetária Estrita**: Adicionado formatador com 2 casas decimais estritas (`maximumFractionDigits: 2`), eliminando dízimas no resumo de orçamento e na mensagem de texto do WhatsApp.
- **Scrollbar Slim**: Ajustada barra de rolagem lateral ultra-fina e discreta.

### 🟢 `8b53232` — Painel com Botão Fixo, Carrinho Limpo & Remoção de Mensalidades Específicas
- **Painel de Orçamento Responsivo**: Card com altura máxima da tela (`max-h-[calc(100vh-2rem)]`), scroll interno no conteúdo e botão *"Copiar Mensagem WhatsApp"* **fixado permanentemente no rodapé**, 100% visível sem rolar a tela.
- **Carrinho Limpo**: Removida a tag de mensalidade entre parênteses (`+ R$ .../mês`) da lista de itens do carrinho, mantendo apenas o valor unitário do equipamento.
- **Mensalidades Removidas**: Zeradas as mensalidades dos produtos *Urbano Omnicarreta*, *Omnicarga 4G Descartáveis* e *Omnicarga 4G Retornáveis*.

### 🟢 `5dc7a1a` — Nome do Painel "Orçamento", WhatsApp Limpo e Mensalidades Estritas por Equipamento
- **Título do Painel**: Alterado de "Carrinho do Orçamento" para simplesmente **"Orçamento"**.
- **Texto da Proposta no WhatsApp**: Atualizado de `Mensalidade de Serviços & Telemetria` para simplesmente **`Mensalidade de Serviços`**.
- **Mensalidades Estritas em Equipamentos Principais**:
  - **TURBO**: R$ 205,86/mês (somente equipamentos principais OMNITURBO)
  - **DUAL**: R$ 130,60/mês (somente equipamentos principais OMNIDUAL)
  - **LORA**: R$ 20,00/mês (somente OMNILORA/OMNICARGA LORA principais)
  - **OMNICARRETA**: R$ 59,00/mês (somente equipamentos OMNICARRETA principais)
  - **DASHCAM**: R$ 130,00/mês (somente unidades principais DASHCAM/OMNISAFE)
  - **Kits e Acessórios**: Removida a mensalidade de todos os produtos combinados em Kit (com `+`) e acessórios/cabos/travas (`monthly_fee: 0.00`).

### 🟢 `72bddec` — Persistência de Estado no Recarregamento da Página (F5)
- **Aba Ativa (`activeTab`)**: Ao recarregar a página (F5), o sistema permanece exatamente na página onde o usuário estava (`catalog`, `opportunities`, `commissions`, etc.), em vez de voltar para o Dashboard.
- **Estado do Orçamento**: Salva e restaura o carrinho de equipamentos, nome do cliente, acréscimo (%), desconto (%) e toggles de pagamento via `localStorage`.
- **Botão Limpar Orçamento**: Adicionado botão de ação rápida "Limpar" no cabeçalho do carrinho para resetar o orçamento com 1 clique quando necessário.

### 🟢 `b5af693` — Mapeamento de Mensalidades & UI Limpa nas Opções do Orçamento
- **Valores de Mensalidade Mapeados**:
  - Linhas **OMNITURBO**: R$ 205,86/mês
  - Linhas **OMNIDUAL**: R$ 130,60/mês
  - Linhas **OMNISAFE / DASHCAM**: R$ 130,00/mês
  - Linhas **OMNICARRETA**: R$ 59,00/mês
  - Linhas **OMNILORA**: R$ 20,00/mês
- **Toggle `includeMonthlyFee`**: Adicionada a opção `Mensalidade de Serviços` nas opções do orçamento para incluir ou ocultar a mensalidade no WhatsApp.
- **UI Minimalista**: Removidos os valores monetários repetidos dos botões de seleção de pagamento ("Opções do Orçamento"), eliminando redundâncias visuais.

### 🟢 `54d2764` — Sidebar Enxuta (64px) & Cards Clicáveis no Catálogo
- **Sidebar (Barra Lateral)**: Reduzida a largura recolhida para **64px** (`w-16`) mantendo os ícones centralizados e expansão fluída ao passar o mouse.
- **Cards do Catálogo**: Imagem e título dos produtos tornaram-se clicáveis para abrir o modal de detalhes completos; removido o ícone redundante do olho e restaurado o botão *"Adicionar"* / *"Adicionado"*.

### 🟢 `4776ce9` — Acréscimo / Margem (%) no Orçamento
- **Cálculo de Margem**: Adicionado campo para aplicar porcentagem de acréscimo antes do desconto no resumo financeiro.
- **Reajuste Proporcional nos Itens**: O valor unitário dos produtos na mensagem do WhatsApp passa a incorporar o acréscimo proporcionalmente, garantindo que `Soma dos Itens - Desconto = Total À Vista` com 100% de exatidão matemática.

### 🟢 `3836e09` — Vencimento/Renovação PF/PJ & Refinamento de Orçamentos
- **Regra de Vencimento Dinâmica**:
  - **Pessoa Física (PF)**: Vencimento e renovação de **15 dias**.
  - **Pessoa Jurídica (PJ)**: Vencimento e renovação de **30 dias**.
  - Recálculo automático da data de expiração ao alternar o tipo de cliente ou data de registro.
- **Pagamento em Cartão**: Definido parcelamento padrão em **12x sem juros**.
- **Financiamento no WhatsApp**: Atualizado texto para `• Financiamento: em até 36x (com juros sob consulta)`.
- **Remoção da Parcela Ideal**: Removido o simulador de Parcela Ideal a pedido do cliente.

### 🟢 `7b11be4` & `aeaaae5` — Relatório Semanal Automático por E-mail (Vercel Cron & Resend)
- **Vercel Cron Job**: Configurado para rodar todos os domingos às 20:00 BRT (`0 23 * * 0` UTC).
- **Envio de E-mail via Resend API**: Dispara e-mail formatado contendo o relatório de vendas dos últimos 7 dias em anexo `.xlsx`.
- **Detalhamento no Excel**: Arquivo gerado em aba única contendo todos os registros de vendas, detalhamento de repasses a outros vendedores e totais gerais.

### 🟢 `3648b39` — Destaque de Ícones de Calendário & Cores Vibrantes
- **Inputs de Data**: Estilizados os ícones nativos de calendário (`<input type="date">`) com filtro Cyan em CSS global.
- **Sidebar & Modais**: Adicionados ícones de calendário em destaque Cyan/Amber no menu e modais de oportunidades e comissões.

### 🟢 `9180be2` — Saudação Dinâmica & Validação de E-mail
- **Dashboard**: Saudação baseada no horário do dia (*"Bom dia"*, *"Boa tarde"*, *"Boa noite"*).
- **Cadastro**: Validação para evitar e-mails duplicados.

### 🟢 `bee59f4` — Opção de Financiamento em 36x
- **Fórmula Bancária CET**: Implementado cálculo de financiamento em até 36x baseado na tabela CET oficial de banco.

### 🟢 `31c5191` & `e5885f9` — Expansão do Catálogo Oficial (128 Produtos)
- **128 Produtos Oficiais**: Extraídos do PDF oficial da Show Tecnologia.
- **Busca Sem Acentos**: Algoritmo de pesquisa normalizado (`normalizeText`) ignorando diacríticos (`~`, `^`, `´`, `ç`).
- **Categorização**: Divisão em *Equipamentos Principais* e *Acessórios & Sensores*.

---

## 🔒 Credenciais e Variáveis de Ambiente Configuradas

- **Supabase PostgreSQL**: Conectado via Client SDK e Supabase Auth.
- **Resend API Key**: Configurada no `.env.local` e nas variáveis de ambiente da Vercel.
- **Cron Secret**: configurar somente na variável de ambiente `CRON_SECRET`; nunca registrar seu valor no repositório.

---

*Última atualização registrada: 10 de Outubro de 2026.*
