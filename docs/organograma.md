# Organograma e gestão de colaboradores

Implementação inicial de 13/10/2026.

## Acesso

- `/organograma`: consulta autenticada, disponível no menu lateral.
- `/organograma/gerenciar`: gestão restrita aos administradores cadastrados em `admin_users`.
- O botão **Gerenciar** usa o resultado de `can_manage_organization()`. O banco aplica a mesma regra em todas as escritas, independentemente da interface.
- Colaboradores são independentes de contas de acesso; cadastrar uma pessoa não cria um usuário nem envia mensagens.

## Dados iniciais

Foram importados 20 colaboradores da planilha fornecida, com 18 fotos extraídas do PDF. Os 19 consultores respondem à liderança comercial indicada na planilha, conforme confirmação explícita do usuário. Não foram adicionadas pessoas fictícias nesta etapa.

As fotos foram associadas pelos rótulos das páginas, e não simplesmente pelo número da linha. Dois colaboradores sem foto usam iniciais; um cadastro não tem e-mail. Um domínio de e-mail divergente foi preservado conforme a fonte e precisa de confirmação humana. Identidades, contatos e documentos de origem não são publicados no repositório.
Unidade, ramal, atribuições e atendimento ficaram vazios quando não fornecidos. O cargo recebeu somente capitalização inicial. Nenhum contato foi inventado.

## Consulta

- React Flow 12.12.0 e ELK.js 0.12.0, carregados na página do organograma.
- Cartões, linhas de liderança, zoom, pan, minimapa, tela cheia e equipes recolhíveis.
- Equipes com muitos pares são distribuídas em colunas compactas; cada linha continua apontando para o gestor real.
- Busca por nome, cargo, contatos, departamento, unidade, atribuições e atendimento. Digitar mostra sugestões; escolher um resultado revela a ramificação e move o mapa suavemente.
- Modo foco mostra a pessoa, liderança e equipe direta. Voltar restaura o estado anterior, inclusive enquadramento e filtros.
- Hierarquia, agrupamento por áreas e lista. No celular, a lista é a visão inicial; o perfil usa um painel com foco de teclado contido.
- Preferência por movimento reduzido respeitada. Enter/Espaço em um cartão abre o perfil.
- Exportação dos resultados em CSV, com proteção contra fórmulas em células exportadas. Exportação gráfica em PDF/PNG não está incluída nesta etapa.

## Gestão

- Cadastro e edição de pessoas, foto, contatos, cargo, departamento, unidade, gestor, atendimentos e atribuições.
- Ativação/inativação, identificação explícita de cadastros fictícios, busca e filtros administrativos.
- Cadastro/edição de departamentos e exclusão somente quando não existem pessoas vinculadas.
- Cargos e unidades são textos com sugestões dos cadastros existentes; não possuem catálogo administrativo separado nesta etapa.
- Histórico automático de alterações. Administradores podem consultá-lo, mas não criar ou apagar eventos diretamente.
- Verificação de ciclos, proibição de liderança inativa e impedimento de inativação de um gestor com liderados ativos, inclusive no banco.
- Edições usam `updated_at` como controle de concorrência para rejeitar sobrescritas de um cadastro alterado por outra pessoa.

## Fotos e privacidade

Todas as fotos ficam no bucket privado `organization-photos`, limitado a JPG/PNG/WebP e 5 MB. Antes da publicação, as 18 imagens iniciais foram transferidas pela sessão administrativa autenticada. A auditoria confirmou que somente `photo_path` e `updated_at` mudaram; nenhum outro campo foi alterado.

A rota `/api/organograma/fotos/[id]` valida o token com Supabase Auth, consulta o cadastro com RLS e baixa a imagem no Storage usando a mesma identidade. A resposta gera miniaturas WebP de até 384 × 384 px, com orientação corrigida e proporção preservada; o original permanece no Storage. A URL inclui a versão e o caminho imutável da foto. Respostas versionadas usam `private, max-age=300`, `Vary: Authorization` e `nosniff`; erros e clientes sem versão usam `private, no-store`. Uma versão divergente do cadastro retorna 409. Não há cache público compartilhado. URLs de blob são liberadas ao sair do provedor/sessão. Falhas não ficam em cache e o avatar tenta novamente até duas vezes. Após confirmar a gravação do cadastro, a interface aplica a foto selecionada imediatamente. Se a gravação falhar, preserva a prévia e reutiliza o upload na próxima tentativa. Não existem chaves privilegiadas no frontend.

O repositório GitHub é público. Planilha, PDF, imagens extraídas, manifesto, seed com contatos e script específico de importação ficam ignorados no Git. O build depende apenas do código; não precisa dessas fontes privadas. A ferramenta local temporária usada para transferir as fotos foi removida antes da publicação.

## Banco e reprodução da importação

Migração aplicada ao projeto Supabase `assistente-show` (`nwuheljjsviakffyeqmx`): `supabase/migrations/20261014011613_organization_chart.sql`.

`scripts/import-organization.py` lê os documentos fornecidos e produz os arquivos privados e `supabase/seed_organization.sql`. Esses arquivos são locais e ignorados no Git. O script não escreve no banco. O seed original foi aplicado separadamente, é transacional e não sobrescreve IDs existentes. Após a transferência para Storage, os caminhos atuais no banco são a referência; o seed original com caminhos locais é apenas um registro da importação, não um backup atualizado. Os documentos originais foram preservados.

## Verificação

- TypeScript e testes locais de hierarquia/layout.
- Compilação de produção sem dependência de documentos, manifesto ou imagens locais.
- Testes no banco real em transações revertidas: leitor autenticado, escrita recusada para não administrador, acesso anônimo recusado, criação/edição administrativa, auditoria, ciclo, inativação de gestor e departamento referenciado.
- Verificadores do Supabase não apontaram problemas de segurança nas novas tabelas. Avisos pré-existentes de senha comprometida e desempenho de outras tabelas não foram alterados. Referências: [proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), [índices de FKs](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys), [RLS](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan). O índice novo do histórico ainda sem uso é esperado antes da primeira consulta pela aplicação.
- `tests/organization-browser.cjs`: navegador com transporte Supabase simulado, sem gravações reais. Verifica busca animada, foco/retorno, leitura, cadastro/edição/recarregamento, falha e repetição de gravação, acesso administrativo, tema escuro, versão móvel e teclado. A rota real de fotos também foi consultada sem credencial e respondeu 401.
- As capturas dos testes usam a importação local com `ORG_FIXTURE` opcional. Sem essa variável, o teste utiliza colaboradores fictícios. Não existe atalho de autenticação na aplicação.

Consulta autenticada real com 20 colaboradores e 18 fotos, acesso à gestão, atualização dos vínculos de foto e envio ao Storage verificados antes da publicação. Os testes automatizados do navegador isolam o transporte; as regras do banco foram verificadas separadamente no Supabase real. Nem todas as combinações de cadastro e perfis reais foram exercitadas.

Publicação de produção autorizada em 13/10/2026. Resultado e revisão publicada registrados em `PROJECT_HISTORY.md`. E-mail continua usando `mailto:` e telefone usa `tel:`; ações separadas de WhatsApp/Ligar e novos setores ficam para a próxima etapa.

## Ajustes de 14/10/2026

- Avatares do mapa aumentados de 44 para 56 px. O card inteiro continua abrindo o perfil por clique ou teclado; removido o texto redundante “Ver perfil”. Controles de expandir equipe permanecem.
- Corrigida a corrida entre upload e gravação do cadastro, que podia carregar uma foto antiga/ausente e guardar o resultado na memória.
- Testes cobrem cache, troca de sessão, versão/autorização da rota, miniatura, upload com falha/repetição, substituição, remoção e nova tentativa após indisponibilidade temporária.
- Medição local das 18 imagens iniciais: 6.909.018 bytes originais para 312.952 bytes nas miniaturas (aproximadamente 95% de redução). Isso mede volume transferido, não tempo garantido de carregamento.

## Animação de equipes

Expandir/recolher usa uma transição de 300 ms nas posições controladas do React Flow, com desaceleração suave e opacidade na entrada/saída. As linhas acompanham as posições dos cards; cards em saída ficam sem interação ou foco e são removidos ao terminar. Uma nova expansão cancela a animação anterior e parte do estado visual atual. A câmera centraliza o gestor após a transição. Movimento reduzido desativa a animação. Não há dependência adicional.
