# 📌 Histórico de Progresso & Changelog — Assistente Show

Este documento mantém o histórico oficial de atualizações, funcionalidades comitadas e estado do projeto **Assistente Show** (Show Tecnologia • Omnilink).

---

## 🚀 Informações Gerais do Projeto

- **Nome do Projeto**: Assistente Show
- **Organização**: Show Tecnologia • Omnilink
- **Tecnologias**: Next.js 14 (App Router), React, TypeScript, TailwindCSS, Supabase (PostgreSQL), Resend API, Vercel Cron.
- **Link de Produção (Vercel)**: [https://assistente-show-qymy.vercel.app](https://assistente-show-qymy.vercel.app)
- **Repositório GitHub**: [https://github.com/DevJohn23/assistente-show.git](https://github.com/DevJohn23/assistente-show.git)
- **Estado Atual**: 100% Funcional e Sincronizado em Produção (`main`).

---

## 📍 Ponto de Parada Atual
- **Último Commit**: `Orçamento Inteligente & Gerenciamento de Kits Prontos`
- **Descrição**: Assistente guiado de Orçamento Inteligente por perfil de veículo; Gerenciador de Kits Prontos com menu de 3 pontinhos (edição e exclusão); ampliação do painel de orçamento e melhorias visuais no catálogo.

---

## 📜 Histórico de Commits e Funcionalidades (Linha do Tempo)

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
- **Cron Secret**: `assistente_show_cron_secret_2026`

---

*Última atualização registrada: 06 de Agosto de 2026.*
