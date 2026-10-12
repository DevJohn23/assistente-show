# Etapa 7 — Administração

Implementação local em 12/10/2026. Produtos e técnicos mantêm os campos e operações existentes.

- Superfícies, azul principal, controles, tabelas e espaçamento alinhados às demais telas; busca separada dos resultados.
- Formulários e confirmação de exclusão no QuoteDialog compartilhado (foco, Escape, backdrop, bloqueio durante envio).
- Feedback de leitura, gravação, upload e exclusão; repetição após falha; proteção contra envio duplicado.
- Escritas solicitam retorno de id e exigem resposta válida antes de anunciar sucesso.
- Categoria preexistente e coordenadas preservadas ao editar técnico. Novo técnico exige localização selecionada; texto de endereço não confirmado impede salvar coordenadas antigas.
- Autocomplete administrativo migrou para Photon, como Rede técnica; cancelamento ao editar/fechar. Nominatim público não permite autocomplete.
- Valores monetários formatados em reais; mensagens de lista vazia e labels acessíveis.
- Acesso direto continua condicionado ao usuário e isAdmin do AuthContext. Redirecionamento usa replace. Não altera política de autorização/RLS do banco; teste de interface não substitui auditoria de permissões remotas.
- Sem deploy ou alterações reais nos dados. Recuperação real de senha e URLs autorizadas seguem pendentes da etapa 4.

## Verificação

- TypeScript, build de produção e testes de regressão em Node passaram. Ajuste posterior de validação de coordenadas checado novamente por TypeScript.
- `tests/admin-browser.cjs`: acesso direto sem permissão, CRUD de produtos com falha/repetição, bloqueio de envio duplicado, validação de endereço, criação/edição de técnicos e preservação de categoria/coordenadas, falha de leitura e recuperação, temas e largura móvel passaram com respostas simuladas.
- Capturas desktop e editor centralizado revisadas; contraste do tema escuro ajustado para evitar sobreposição de estilos legados.

- Suíte geral de navegador aprovada na execução final, sem erros de runtime; dashboard, navegação/tema, comissões, oportunidades, kits, leitura com repetição, administrador e saída.
