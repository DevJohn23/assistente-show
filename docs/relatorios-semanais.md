# Relatórios semanais por e-mail

## Estado da correção

Migração aplicada e permissões verificadas em produção. Atualização em processo de publicação; envio real ainda será validado.

O site pode continuar em `vercel.app`. O remetente do Resend precisa de domínio próprio com acesso ao DNS; instalar o plugin no Codex não substitui essa verificação. O domínio de teste `resend.dev` só permite enviar para o proprietário da conta Resend. O provedor Gmail já configurado permite operar sem domínio próprio.

## Comportamento

- Cron existente: domingo, 23h UTC (20h em São Paulo; a precisão depende do plano Vercel).
- Período fechado: domingo anterior até sábado, usando o calendário de São Paulo. Registros do domingo do envio entram no próximo relatório.
- Todos os usuários da autenticação com e-mail recebem o relatório, inclusive sem movimentação. Contas sem e-mail são contabilizadas como ignoradas.
- Excel com abas Comissões (data da venda) e Oportunidades (toda a carteira em acompanhamento: active, renewed e expired, independentemente do cadastro). Comissões representam movimentação semanal; oportunidades são uma fotografia da carteira atual. Nenhum deles substitui um backup integral do banco.
- Busca paginada de usuários e registros, filtrada no banco pelo dono e pelo período. O e-mail de destino é o cadastrado na autenticação.
- E-mail destaca vencimentos de segunda a domingo da semana seguinte, com dias restantes a partir do domingo de referência. Vencidas e vencimentos no próprio domingo aparecem em grupos separados. Ganhas e perdidas são excluídas; anexo ordenado por vencimento.
- Nome e nomes de clientes escapados no HTML; dados das planilhas escritos como valores, sem fórmulas provenientes dos usuários.
- O total `accepted` significa aceitação pela API do Resend, não confirmação de entrega na caixa de entrada. Falhas ou pendências retornam HTTP 503, nunca sucesso falso.
- Registro persistente por usuário/semana impede duplicações e concorrência. Não armazena e-mails, nomes nem dados comerciais na tabela de controle.

## Ativação

1. Obter um domínio próprio ou autorização para usar um domínio da empresa. Não é necessário migrar o site ou comprar uma caixa postal.
2. Adicionar domínio/subdomínio no Resend e configurar os registros DNS indicados pelo painel. Aguardar status verificado.
3. Aplicar `supabase/migrations/20261022031831_weekly_report_deliveries.sql` pelo fluxo de migrações. A tabela tem RLS e acesso apenas pelo servidor/service_role.
4. Configurar `WEEKLY_REPORT_FROM`, por exemplo `Assistente Omnilink <relatorios@seu-dominio>`, junto das variáveis existentes `RESEND_API_KEY`, `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` e `NEXT_PUBLIC_SUPABASE_URL`, apenas no servidor.
5. Conferir quota/plano do Resend para o número de usuários e limites de duração do projeto Vercel. O processamento é sequencial, com intervalo mínimo de 600 ms entre envios e orçamento de execução de 240 s; bases maiores exigem fila/lotes com continuação antes da ativação.
6. Publicar e realizar um teste controlado autorizado. A rota de produção percorre todos os usuários: não usá-la como teste de destinatário único.
7. Acompanhar logs de execução na Vercel e eventos de entrega/bounce no Resend.

## Falhas e recuperação

Não há retentativa automática: Vercel Cron não garante reexecução após falha. Reinvocar a rota autenticada na mesma semana continua usuários ainda não registrados e ignora os já aceitos. O período é calculado na execução; depois do próximo domingo, uma recuperação histórica exige procedimento específico.

Registros `processing` remanescentes ou `needs_review` exigem conferir o Resend antes de qualquer reenvio. Podem representar erro do provedor, timeout ou sucesso cujo registro local não foi confirmado. O código não apaga essas reservas automaticamente, evitando duplicações após o prazo de 24 horas da chave de idempotência do Resend. Após confirmar inequivocamente que não houve envio, o administrador pode remover exclusivamente a reserva daquele usuário/período e repetir na mesma semana. Se houve aceitação, registrar o ID do provedor e status `accepted`. Nunca limpar a tabela inteira para retentar.

Os testes usam transportes simulados; domínio, DNS, migração e entrega real precisam ser validados na ativação.


## Gmail temporário (21/10/2026)

O envio também aceita `WEEKLY_REPORT_PROVIDER=gmail`, `GMAIL_USER` e `GMAIL_APP_PASSWORD`. O remetente é a conta autenticada, com nome “Assistente Omnilink — Relatórios”. Nenhuma alteração do nome pessoal no Google é necessária. A senha deve ser de aplicativo, criada com verificação em duas etapas, cadastrada diretamente como Secret na Vercel/Production. Revogar credenciais compartilhadas em conversas e substituí-las no painel. Nunca salvá-las no repositório.

SMTP Gmail usa TLS na porta 465, limites de tempo e mensagens individuais. Aceitação SMTP não confirma entrega na caixa de entrada. Gmail não oferece idempotência pela API Resend; o bloqueio persistente por usuário/semana permanece responsável por evitar duplicações. Envios incertos exigem conferência, sem retentativa automática. Cotas do Gmail e tempo total do cron devem ser conferidos antes de ativar para todos.

Estado: endereço, seleção Gmail e senha de aplicativo cadastrados na Vercel/Production; senha armazenada como sensitive, conforme autorização expressa do usuário. Código local, sem deploy, sem migração aplicada e sem teste de envio real.


## Verificação e operação

- Teste de configuração: `POST /api/cron/weekly-report/test`, protegido pelo mesmo Bearer `CRON_SECRET`. Envia exclusivamente para `GMAIL_USER`, com dados fictícios; não lê oportunidades/comissões reais nem reserva uma entrega semanal. Nunca aceita destinatário fornecido na requisição.
- O agendamento permanece `0 23 * * 0`. Em planos sem precisão de minuto, pode executar entre 20h e 21h de Brasília.
- Migração remota registrada como `20261022031831`; arquivo local alinhado ao identificador retornado pelo Supabase.
- Verificação: RLS habilitada, anon/authenticated sem SELECT, service_role com INSERT. Aviso informativo de RLS sem policies é intencional nesta tabela exclusiva do servidor. Aviso pré-existente sobre proteção de senhas vazadas no Auth é independente deste recurso.
