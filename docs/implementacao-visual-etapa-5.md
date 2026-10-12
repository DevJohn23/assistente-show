# Oportunidades — etapa 5

11/10/2026. Alterações locais, sem publicação.

- Cabeçalho próprio e ação Nova Oportunidade, seguindo Comissões e Orçamentos.
- Busca e filtros em bloco separado dos registros, sem legendas redundantes.
- Tabela com datas brasileiras, situação por texto e cor, documentos/contatos legíveis e ações acessíveis por teclado.
- Modal centralizado para cadastro e edição, fundo desfocado, conteúdo rolável e ações fixas. Notas completas em diálogo; renovação e exclusão identificam o cliente e mantêm erros visíveis.
- Antiga visualização Calendário (que já era uma grade de cartões) passa a se chamar Por vencimento e ordena os cartões pela data. Mantém acesso às ações e oferece estado vazio.
- Layout em cartões no celular e adaptação aos temas compartilhados.

## Regras preservadas

Cadastro sugere 15 dias para PF e 30 para PJ, com vencimento manual disponível. Renovação continua somando o prazo ao vencimento atual, não à data de hoje. Filtros e função de exportação preservados; exportação inclui os registros filtrados. Nenhuma nova operação de encerramento ou alteração de status foi introduzida; situações ganha/perdida já existentes são apresentadas como tais, sem alerta de atraso.

Data de cadastro vazia não produz uma data inválida no formulário. Nome e telefone passaram a expressar por campos obrigatórios a validação já existente no envio. Cliques duplicados não iniciam outra gravação nem produzem mensagem falsa de erro enquanto a primeira está em andamento.

## Validação

Testes com Supabase simulado, sem contatos por WhatsApp, gravações reais ou e-mails. Suíte específica cobre cálculo PF/PJ, vencimento manual, falha/reenvio/duplicidade, Excel filtrado, URL do WhatsApp, leitura de notas, edição, renovação com falha e nova tentativa, exclusão, cartões, estado vazio e responsividade.

Resultado: TypeScript, build de produção, suíte geral de regressões e suíte específica de Oportunidades passaram. Filtros e função de exportação comparados integralmente com a versão anterior. Capturas de desktop, modal e tema escuro conferidas.
