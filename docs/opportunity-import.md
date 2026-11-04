# Importação de oportunidades

A implementação está disponível em `/teste-oportunidades` quando o Next.js roda em desenvolvimento. Esta rota usa a mesma interface do módulo real e salva uma carteira de teste no localStorage do navegador (`opportunity-local-preview-v1`). Não envia oportunidades ao Supabase. A rota retorna 404 em builds de produção.

## Testar

1. Rodar `npm run dev -- --hostname 127.0.0.1 --port 3100`.
2. Abrir `http://127.0.0.1:3100/teste-oportunidades`.
3. Clicar em Importar oportunidades, selecionar o CSV e escolher PJ (30 dias) ou PF (15 dias).
4. Conferir a prévia e confirmar. O prazo começa na data original do arquivo.
5. Reenviar o mesmo arquivo: os registros idênticos ficam desabilitados. Um arquivo com novos IDs permite acrescentar somente os novos.
6. Para diferenças, habilitar a revisão e selecionar cada atualização. O prazo existente é mantido, salvo quando “Recalcular prazo” for marcado.

## Formato e limites

CSV UTF-8 (com ou sem BOM), com fallback Windows-1252. Separadores vírgula ou ponto e vírgula; campos entre aspas, aspas escapadas e quebras de linha são aceitos. Colunas obrigatórias: `ID`, `Nome do Cliente`, `Data Cadastro`. Datas `AAAA-MM-DD` ou `AAAA-MM-DD HH:MM:SS`. Máximo 2 MB / 2.000 registros por arquivo. Outras colunas, inclusive status e vendedor, são ignoradas. O usuário conectado é o dono da importação real.

Nome e data são dados de negócio; ID e origem são metadados de deduplicação. CPF/CNPJ e telefone podem ficar vazios, com preenchimento posterior. WhatsApp não aparece sem dígitos no telefone.

## Segurança e consistência

- A migração `20261104011034_opportunity_csv_import.sql` foi aplicada em produção em 03/11/2026 (versão UTC registrada pelo Supabase).
- A função é SECURITY INVOKER, usa auth.uid(), respeita RLS e só pode ser executada por authenticated.
- Índice único por usuário + origem + ID; imports são serializados por usuário.
- Lote transacional: erro desfaz todo o lote. Updates exigem snapshot da prévia para impedir sobrescrita concorrente de nome, tipo e datas.
- O snapshot de origem distingue reenvio do mesmo arquivo de alterações feitas manualmente. Contato, documento, observações e status internos não são substituídos pela importação.
- Coincidências de nome são avisos, nunca fusão automática. IDs repetidos dentro do mesmo arquivo são inválidos.
- Busca, filtros e exportação abrangem a carteira completa; paginação de 10/25/50/100 é aplicada depois de filtrar e ordenar. Consulta ao banco é paginada para não truncar em 1.000 registros.

## Validação

- `node --test tests/opportunity-import.cjs`: parser, limites, datas, reimportação e ordenação.
- `tests/opportunity-import.sql`: rodar somente em PostgreSQL isolado com esquema e migração instalados; testa RLS, repetição, rollback e atualização.
- `tests/opportunity-import-browser.cjs`: requer Playwright via NODE_PATH e servidor local; bloqueia hosts externos, usa dados sintéticos e testa fluxo, paginação, persistência e responsividade.
- `tests/opportunities-browser.cjs`: regressão dos fluxos manuais, com Supabase interceptado.

A migração foi aplicada e deve acompanhar a publicação do código. O teste localStorage verifica a experiência; a implementação SQL foi validada no PostgreSQL local e no Supabase em transação revertida, sem deixar registros de teste. A rolagem da prévia é testada com mouse e teclado, inclusive em janela baixa.
