# Implementação visual — etapa 1

11/10/2026. Alterações locais; sem publicação na Vercel nesta etapa.

## Escopo

- Base visual: tipografia Inter com fallback do sistema, cores compartilhadas para os temas claro e escuro, controles e estados de foco consistentes.
- Navegação: menu expandido por padrão, recolhimento explícito e preferência persistida. Sem expansão por hover. Navegação mobile em diálogo com fechamento por Escape.
- Conta: identificação do usuário, papel, tema claro/escuro/automático e sair. Administração segue a verificação de administrador existente. Edição de perfil e alteração de senha serão implementadas em etapa própria.
- Início: três ações em formato de botão, quatro indicadores, contatos prioritários e resumo de comissões. Removidos gráfico semanal, próximos vencimentos e links repetidos.
- Indicadores: vendas/comissões abrem o mês correspondente; vencidas e vencendo hoje abrem os filtros correspondentes. Oportunidades encerradas como ganhas/perdidas não entram nessas pendências.
- Carregamento: identidade simples, mensagem de estado e respeito à preferência por movimento reduzido.

## Decisões consolidadas

O painel de orçamento também terá recolhimento próprio na etapa do catálogo. O redesenho preservará entrada, financiamento, formas de pagamento, edição de valores e kits. O mockup inicial não era uma especificação completa das regras comerciais.

O menu da conta não repetirá o controle de recolhimento da lateral. A preferência é salva pelo próprio botão da navegação.

## Validação local

Os testes de navegador interceptam o Supabase e usam dados fictícios. O teste não cria sessões reais nem grava registros de produção. A interface acessada manualmente no localhost utiliza o serviço configurado em `.env.local`; localhost não cria automaticamente um banco isolado.

Cenários cobertos pelo teste: persistência do recolhimento, tema automático respondendo à preferência do sistema, filtros da dashboard, atalhos de criação, layout de notebook/celular, menu mobile, visibilidade administrativa, saída da conta e regressões de persistência já existentes.

## Resultado da verificação

- TypeScript e build de produção aprovados.
- 14 testes de regressão aprovados.
- Testes de navegador aprovados, incluindo as falhas simuladas de gravação e leitura.
- Capturas inspecionadas em 1366 × 768 (desktop), 390 × 844 (celular) e tema escuro.
- Nenhuma publicação ou alteração de estrutura do Supabase nesta etapa.

## Próxima etapa

Aplicar a base aprovada a Produtos/Orçamento, incluindo painel recolhível, entrada e financiamento. Depois migrar Comissões e seus formulários. As alterações em filtros dessas duas áreas nesta etapa servem apenas à navegação da dashboard; seus layouts ainda são os anteriores.
