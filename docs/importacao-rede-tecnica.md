# Importação da rede técnica

Em **Administrador → Técnicos → Importar KML**, envie o mapa inteiro exportado do My Maps como `.kml`, sem link de rede. KMZ não é aceito nesta versão. Limites: 5 MB e 5.000 pontos. O arquivo é interpretado no navegador; links e recursos externos nunca são carregados.

1. Confira o nome do mapa, a quantidade e os avisos de leitura.
2. Gere a prévia, que compara com a rede atual no banco e mostra novos, alterados e ausentes. Expanda as alterações para comparar campos.
3. Ausentes são mantidos por padrão. Marque a inativação somente com o mapa completo; ela retira os ausentes da consulta sem excluir seus registros.
4. Marque a confirmação e aplique. A gravação e o histórico são uma transação: erros não deixam a rede parcialmente atualizada.

A comparação utiliza o nome sem diferença de maiúsculas/minúsculas e espaços nas extremidades. Nomes duplicados bloqueiam a importação. Renomeações aparecem como um cadastro novo e um ausente; revise-os. Campos de contato são extraídos da descrição do KML, com avisos quando não reconhecidos; confira os valores antes de confirmar, inclusive eventuais campos que ficariam vazios. O sistema não consegue certificar que o arquivo contém a versão mais recente ou todas as camadas.

O histórico mostra as 20 operações mais recentes, com arquivo, horário e administrador. **Restaurar versão anterior** recupera a rede de antes da operação escolhida, com nova prévia e confirmação. Cadastros posteriores são mantidos inativos. Alterações posteriores podem ser desfeitas; a própria restauração gera um novo histórico e pode ser revertida.

Novos dados aparecem ao reabrir/recarregar a consulta da rede. A listagem usa paginação para não truncar redes maiores que o limite de resposta do Supabase.

## Implementação

- Migração `20261027010541_technical_network_import.sql`: `tecnicos.is_active`, histórico com RLS e RPC `import_technical_network` com `security invoker`.
- Autorização validada no banco com `can_manage_organization()`, baseada na tabela `admin_users`. Nenhuma chave de serviço no navegador.
- RPC valida o conteúdo, mantém IDs existentes e usa uma impressão digital da rede e da prévia. Edições concorrentes exigem nova conferência. Aplicação bloqueia escritas concorrentes durante a transação.
- Arquivos vazios, inválidos, duplicados, entidades XML, links de rede e geometrias que não sejam pontos são rejeitados.
- Não há sincronização Google nem deploy automático ao importar. Não se deve reimportar o antigo `full_map.kml` para produção sem validar sua atualidade.

## Verificação

- `npm test` e `npx tsc --noEmit`.
- `tests/technical-kml.cjs`: DOMParser real, arquivo local de 124 pontos e entradas inválidas. Requer Playwright/Chromium.
- `tests/technical-import-browser.cjs`: interação com dados simulados; todas as chamadas remotas interceptadas. `TEST_BASE_URL` define o servidor local.
- `tests/technical-import.sql`: RPC como administrador, restauração, concorrência, inativação e acesso negado a usuário comum. Executar em ambiente de teste; todas as modificações de linhas usam rollback.
