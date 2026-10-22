# 📌 Histórico de Progresso & Changelog — Assistente Show

Este documento mantém o histórico oficial de atualizações, funcionalidades comitadas e estado do projeto **Assistente Show** (Show Tecnologia • Omnilink).

---

## 22/10/2026 — Ativação dos relatórios semanais e carteira de oportunidades

- Comissões: registros da semana encerrada (domingo a sábado). Oportunidades: carteira inteira em acompanhamento, independentemente do cadastro, ordenada por vencimento; ganhas/perdidas excluídas.
- E-mail destaca vencimentos de segunda a domingo seguintes, com dias restantes a partir do domingo de referência. Vencidas e vencimentos no próprio domingo aparecem em grupos separados.
- Migração `20261022031831_weekly_report_deliveries` aplicada em produção. RLS e privilégios verificados: anon/authenticated sem leitura, service_role com acesso. Aviso informativo de ausência de políticas é intencional para esta tabela privada do servidor.
- Teste operacional protegido em `POST /api/cron/weekly-report/test`: destinatário fixo na conta remetente, dados fictícios e validação de acesso ao registro de entregas. Não dispara para os usuários.
- Verificação antes de publicar: testes de regressão/organograma/relatórios aprovados, incluindo limites semanais, paginação, isolamento de dados, rejeição SMTP, conteúdo vazio e autenticação do teste; build Next.js de produção, lint e TypeScript aprovados. Navegador automatizado local indisponível; nenhum componente visual foi alterado.
- Publicado o commit `417d569` em produção (deploy `dpl_DMy3UfCW25jNN7sxP9E594qMPsTr`, READY). Chave CRON_SECRET sincronizada e armazenada como sensitive após detectar divergência local/produção; nenhum segredo versionado.
- Teste real autenticado retornou HTTP 200, `accepted: 1`, `database: ok`, com dados fictícios e destinatário fixo no remetente. Gmail confirmou aceitação SMTP; confirmação visual na caixa de entrada depende do destinatário. Nenhum relatório real enviado aos demais usuários.
- Agendamento mantido aos domingos, 23h UTC (20h Brasília; plano Hobby pode executar dentro da hora). Verificação HTTP de produção: início/organograma/admin 200 e rotas de cron/teste sem credenciais 401.

## 21/10/2026 — Integração Gmail para relatórios (local)

- Adicionado provedor Gmail via SMTP/TLS e nome de remetente “Assistente Omnilink — Relatórios”, sem alterar o nome da conta Google.
- Credenciais exclusivamente em variáveis de servidor; endereço e seleção do provedor cadastrados na Vercel. Senha compartilhada no chat não gravada no projeto; substituição por nova senha de aplicativo recomendada.
- Falhas e destinatários rejeitados não são contabilizados como sucesso. Controle persistente de duplicações preservado.
- Testes específicos de relatórios/Gmail (6 casos), TypeScript e verificação de diff aprovados. Validação SMTP real pendente.
- Credencial cadastrada na Vercel/Production como sensitive após autorização expressa do usuário para utilizar a senha fornecida. Nenhuma senha gravada no repositório.
- Ativação pendente de migração, publicação e validação real. Nenhum e-mail real enviado.

## 20/10/2026 — Correção local dos relatórios semanais (ativação pendente)

- Incluídas oportunidades e comissões em abas separadas do Excel; usuários sem movimentação também recebem relatório. Paginação e filtros por usuário/período no banco.
- Período fechado de domingo a sábado em São Paulo; cron existente de domingo à noite preservado.
- Remetente configurável via `WEEKLY_REPORT_FROM`, sem fallback para domínio de teste. Erros retornados pelo Resend agora são tratados como falha; aceitação do provedor é distinguida de entrega.
- Migração de controle de envio por usuário/semana com RLS, acesso exclusivo do servidor e prevenção de duplicações concorrentes. Envios incertos ficam para conferência, sem reenvio automático.
- Verificação local: `npm test`, testes específicos de relatórios, TypeScript (`tsc --noEmit`) e `git diff --check` aprovados. Transportes simulados; migração ainda não validada em banco real.
- Documentação de ativação, limites e recuperação em `docs/relatorios-semanais.md`. Sem deploy, migração em produção ou envio real nesta etapa; domínio próprio verificado ainda necessário.

## 18/10/2026 — Refinamento da proposta comercial

- Financiamento: título “Opções de financiamento”, removida observação de TAC/IOF, colunas com separador central e cabeçalhos Prazo/Parcela mensal; mais respiro entre linhas e seções. PDF de exemplo segue em uma página, com valores preservados e renderização conferida.
- Emissão no canto superior direito, alinhada com o cabeçalho; validade opcional agrupada logo abaixo.
- Checkbox “Incluir responsável comercial”, desmarcado por padrão. Nome e contato só aparecem na revisão quando habilitado e são omitidos do PDF quando desabilitado; autoria do arquivo também deixa de incluir o nome.
- Rótulo “Mensagem: Básico” removido do rodapé do orçamento. Ajuste final mantém o exemplo completo em uma página também com responsável habilitado, com nome e contato lado a lado.
- Remoção da seção libera espaço naturalmente, sem manter um bloco vazio. Alternar o checkbox invalida a prévia anterior.

## 18/10/2026 — Modelos de orçamento e proposta comercial

- Minha conta → Preferências: modelos Básico, Detalhado e Sóbrio, com exemplo de mensagem e habilitação opcional de PDF. Preferências salvas por usuário na autenticação; padrão preserva o modelo básico e PDF desabilitado.
- Detalhado inclui componentes exclusivamente dos kits completos Omniturbo (`prod-1`) e Omnidual (`prod-2`). Antena satélite somente no Omniturbo. Outros equipamentos e acessórios não recebem listas de componentes.
- Botão Gerar proposta PDF abaixo de Copiar mensagem, com revisão de cliente, emissão, validade, responsável, contato e observações. Reaproveita produtos, preços e condições do orçamento; edição da revisão invalida a prévia anterior.
- Proposta A4 gerada no navegador, sem agente IA. Logo oficial sem slogan, seção Cliente omitida se vazia, mensalidade separada e paginação para propostas longas. Nenhum dado de cliente enviado a serviço externo de geração.
- Total de equipamentos não é mais confundido com saldo após entrada na mensagem; ambos são explicitados quando há entrada. Cálculos financeiros existentes preservados.
- Verificação: build de produção e TypeScript aprovados; testes de regressão dos modelos aprovados; fluxo de preferências e geração/download real testado no navegador com transporte simulado; suítes existentes de catálogo e conta também aprovadas, sem erros de execução. PDFs de uma e várias páginas inspecionados visualmente, incluindo cliente em branco.
- Documentação de uso, regras, arquitetura e verificação em `docs/propostas-comerciais.md`. Publicação autorizada pelo usuário após revisão; fluxo de release pela branch `main` para o projeto Vercel `assistente-show-qymy`.

## 18/10/2026 — Favicon e simplificação do carregamento

- Adicionado favicon com “o” branco sobre fundo azul e cantos arredondados, aprovado pelo usuário. SVG escalável, alternativa PNG 32 × 32 e ícone Apple 180 × 180 configurados nos metadados globais.
- Removido o texto visível “Carregando seus dados”; marca e barra animada permanecem. Região de status mantém o rótulo acessível “Carregando”.
- Verificação: TypeScript e revisão de diff aprovados; HTML local contém os três links de ícones e não contém o texto removido. Dimensões dos arquivos PNG verificadas. Sem alterações nos dados ou fluxos de negócio.

## 18/10/2026 — Contraste e organização dos produtos no orçamento

- Versão visual aprovada pelo usuário: cada produto da composição recebe fundo suave individual, cantos arredondados e espaçamento de 10 px, sem bordas nem divisórias entre os cards. O fundo do agrupamento permanece transparente.
- Decisão de UX: o contraste individual cria sensação de camada e facilita associar nome, preço e quantidade ao mesmo produto. Preferir essa diferenciação de superfícies à acumulação de contornos em painéis já delimitados; avaliar sempre no layout real e nos temas claro/escuro.
- Lixeiras e ação “Limpar” em vermelho, com fundo suave no hover e indicação de foco por teclado. Tons adaptados ao tema; confirmação de limpeza preservada.
- Removida a opção “Restaurar preço do catálogo”; edição manual do valor unitário permanece. Teste existente ajustado para digitar o valor, sem depender da ação removida.
- Refinamento validado visualmente pelo usuário em ambiente local antes da autorização de commit e publicação. Nenhuma alteração de preços, produtos ou permissões no banco.
- Verificação final: suíte de navegador do catálogo aprovada, incluindo edição de preços, cálculos, formas de pagamento, kits, celular, temas, controles de quantidade e isolamento dos rascunhos; nenhum erro de execução no navegador. Testes com transporte simulado, sem gravações em produção.

## 14/10/2026 — Consolidação das últimas publicações e validação do usuário

- Fotos e cards do organograma: commit `1aa9755`, publicado. O usuário confirmou o carregamento rápido das imagens após a otimização.
- Ordem estável do catálogo: commit `b5ad5b7`, publicado. Omniturbo e Omnidual permanecem nas duas primeiras posições após edições.
- Animação de expansão/recolhimento: commit `9da74ba`, publicado no deployment `dpl_8W3vbsL2PWg9GD85BEAMHiMmDHwT`, com estado `READY` e domínio de produção associado. O usuário aprovou o resultado visual após experimentar a animação.
- Produção: https://assistente-show-qymy.vercel.app. Detalhes de implementação e verificações estão nas entradas abaixo e em `docs/organograma.md`.
- Organização hierárquica esclarecida: “Responde a” define as conexões; departamento identifica a área; “Atende” é informação textual sobre pessoas, equipes ou públicos apoiados e não cria subordinação.
- O usuário cadastrou direção geral e lideranças de departamentos pela gestão. A disposição com uma liderança comum e liderados diretos lado a lado foi considerada adequada; não foi implementado um ajuste adicional para alinhar raízes independentes. Cadastros ficam no banco e não exigem commit/deploy.
- Esta consolidação altera apenas a documentação. As exclusões locais preexistentes de PDF/KML não fazem parte das publicações.

## 14/10/2026 — Animação discreta ao expandir/recolher equipes

- Transição de 300 ms nas posições dos cards, com entrada/saída gradual e linhas acompanhando o movimento pelo React Flow. Sem bibliotecas adicionais.
- Cliques durante a transição cancelam a execução anterior e reutilizam as posições/opacidades atuais. Cards em saída não recebem cliques ou foco. Movimento reduzido mantém a atualização imediata.
- Centralização existente da câmera ocorre após a reorganização. A estrutura hierárquica e os dados cadastrados permanecem iguais.
- Build/TypeScript, testes Node e suíte de navegador aprovados, incluindo estado intermediário com opacidade, interrupção durante expansão, movimento reduzido, navegação, gestão, fotos, celular e tema escuro. Testes isolados sem gravações reais.


## 14/10/2026 — Ordem estável no catálogo após editar produtos

- Causa: a consulta de produtos não definia uma ordem e a interface preservava a sequência recebida do banco. Atualizar uma foto podia deslocar o card.
- O carregamento agora aplica ordenação determinística por identidade: `prod-1` (Omniturbo) primeiro, `prod-2` (Omnidual) segundo e demais IDs em ordem natural numérica, preservando a sequência do catálogo importado. Novos IDs gerados pelo cadastro entram após os produtos importados. Foto, nome e preço não influenciam a posição.
- Correção apenas na apresentação; nenhum produto, imagem, preço ou permissão foi alterado no banco. Não foi introduzida tela de reordenação manual.
- Regressão automatizada cobre resposta embaralhada, edição de imagem e IDs como `prod-3`/`prod-10`, preservando o array original. Build de produção, testes Node e suíte de navegador do catálogo aprovados, incluindo ordem após edição, filtros, cálculos, kits, celular e isolamento de rascunhos. Transporte simulado, sem escritas na produção.


## 14/10/2026 — Atualização de fotos e refinamento dos cards do organograma

- Corrigida uma corrida entre upload e gravação do colaborador: a interface podia solicitar a foto antes de confirmar o novo vínculo e reter uma resposta vazia/antiga. Agora aplica a prévia após confirmação, não guarda falhas e repete leituras temporariamente indisponíveis.
- Falhas ao salvar preservam a seleção e reutilizam o upload em nova tentativa. Substituições usam caminhos novos; remoção e cadastro continuam na gestão administrativa.
- Rota autenticada entrega WebP de até 384 × 384 px; originais privados permanecem intactos. Cache privado de cinco minutos, separado por Authorization e versão do arquivo; erros não são armazenados. Nenhum dado pessoal novo foi incluído no Git.
- As 18 imagens iniciais passaram de 6.909.018 para 312.952 bytes nas versões de exibição (95% menos bytes, sem promessa de tempo de carregamento).
- Avatares dos cards aumentados de 44 para 56 px. Removida a indicação redundante “Ver perfil”; clique/teclado continuam abrindo o perfil e a expansão de equipes permanece.
- Verificação: TypeScript, build de produção, testes Node e suíte de navegador aprovados. Regressões específicas cobrem upload com gravação rejeitada/repetição, troca, remoção, recarga e recuperação de falha temporária. Testes usam dados fictícios e transporte isolado, sem gravações na produção.
- Investigação apenas de leitura confirmou a presença do arquivo do cadastro relatado. O defeito encontrado é compatível com o atraso observado; não há evidência suficiente para atribuir com certeza cada requisição passada a essa causa.


## Organograma — primeira versão e revisão para produção — 13/10/2026

**Primeira versão revisada e publicada em produção.** O estado abaixo complementa a reestruturação anterior; não substitui os registros históricos.

### Consulta e experiência

- Módulo autenticado `/organograma`, integrado ao menu lateral e com identidade visual própria. Removido o texto “PESSOAS & EQUIPES” do topo a pedido do usuário.
- React Flow 12.12.0 e ELK.js 0.12.0 com layout automático, cartões de pessoas, conexões de liderança, zoom, deslocamento, minimapa, tela cheia e equipes recolhíveis.
- Busca sem acentos; selecionar resultado revela a ramificação e anima o enquadramento. Modo foco mostra pessoa, liderança e equipe direta; Voltar restaura enquadramento e filtros.
- Visualizações Hierarquia, Áreas e Lista, filtro de departamento, perfil com contatos, liderança, subordinados, atendimentos e atribuições; exportação CSV com proteção contra fórmulas.
- Equipes extensas organizadas em colunas compactas, sem transformar colegas em líderes uns dos outros. No celular, lista inicial e perfil com foco de teclado contido; temas claro/escuro e movimento reduzido respeitados.
- E-mail abre `mailto:` e telefone abre `tel:`. WhatsApp/Ligar separados e a expansão com diretor geral e novos setores foram aprovados conceitualmente, mas adiados para depois desta primeira publicação. A imagem de expansão é ilustrativa, não representa novos cadastros reais.

### Gestão, dados e segurança

- `/organograma/gerenciar` restrito aos administradores de `admin_users`, com a mesma autorização aplicada pelo banco; nenhum privilégio é concedido apenas por ocultar botões.
- Cadastro/edição de colaboradores, fotos e departamentos, ativação/inativação e histórico automático de alterações. Cadastro de colaborador não cria conta de acesso nem envia mensagens.
- Proteções contra ciclos de liderança, gestor inativo, inativação de gestor com liderados ativos, exclusão de departamento referenciado e sobrescrita de edição concorrente. Formulários preservam dados após falha e bloqueiam envios duplicados.
- Importação real de 20 colaboradores e 18 fotos. Os 19 consultores respondem à liderança comercial indicada na planilha, conforme confirmação explícita. Dois cadastros usam iniciais por ausência de foto; um não tem e-mail; campos não fornecidos ficaram vazios. Um domínio de e-mail divergente foi preservado para conferência humana.
- Migração `20261014011613_organization_chart.sql` aplicada ao Supabase existente: departamentos, colaboradores, histórico, função de autorização, validações, auditoria e políticas RLS. Bucket `organization-photos` privado, com limite de 5 MB e JPG/PNG/WebP.
- Revisão identificou que o repositório GitHub é público. Fotos, documentos de origem, manifesto e seed com contatos ficaram fora do Git. As 18 fotos foram transferidas ao Storage pela sessão administrativa autenticada; auditoria confirmou que nenhum campo além do vínculo de foto e data de atualização foi alterado.
- Fotos servidas por rota autenticada, com verificação de usuário, leitura do cadastro sob RLS e download do bucket privado usando a mesma identidade. Resposta sem cache compartilhado; nenhuma chave privilegiada no navegador. Build independente dos arquivos pessoais locais.
- A ferramenta local temporária de transferência foi removida. Exclusões preexistentes de PDF/KML permanecem fora desta publicação.

### Verificação e limites

- Testes de lógica/hierarquia/layout e regressões Node aprovados; suíte de organograma no navegador aprovada para busca, foco/retorno, gestão, erros, duplicidade, acesso restrito, teclado, celular e tema escuro.
- Suíte de regressões dos fluxos existentes aprovada, incluindo navegação, dashboard, orçamento, comissões, oportunidades, temas e saída. Testes automatizados usam transporte simulado e não gravam dados reais.
- Sessão administrativa real confirmou leitura dos 20 colaboradores/18 fotos, acesso à gestão e envio de fotos ao Storage. Banco confirmou 18 objetos presentes, bucket privado, zero caminhos de foto locais e 19 subordinados.
- Permissões e validações de banco verificadas em transações revertidas durante a implementação. Nem todas as combinações de contas reais e campos foram exercitadas; não se afirma ausência absoluta de defeitos.
- TypeScript, `git diff --check` e build local final aprovados. A suíte de organograma foi repetida na versão compilada após a mudança das fotos, também aprovada. Conferência do pacote da rota confirmou ausência de arquivos privados.
- Código funcional publicado: `29ce3f35953e5f54f2c26fb97840b081711fe9be`, branch `main`, repositório `DevJohn23/assistente-show`.
- Deployment de lançamento: `dpl_5aQXRo16gbsB8afAevRrKczKS7sh`, projeto `assistente-show-qymy`, equipe `marcos-marinhos-projects`, status READY. Build remoto concluído em 60 segundos.
- Produção: https://assistente-show-qymy.vercel.app/organograma. A checagem pública confirmou login nas rotas de consulta e gestão, rejeição 401 nas fotos sem token/com token inválido, cron preservando 401 sem autorização e ausência de erros de execução do navegador. A consulta inicial aos logs error/fatal não retornou ocorrências. A sessão real autenticada foi exercitada localmente contra o mesmo Supabase; não havia sessão autenticada disponível no domínio de produção para repetir esse fluxo.
- Este registro de conclusão é uma atualização documental posterior ao commit funcional; não altera o comportamento da aplicação. Documentação técnica em `docs/organograma.md`.

---

## Estado atual consolidado — 12/10/2026

**Reestruturação visual concluída e publicada em produção. Recuperação real de senha confirmada pelo usuário após o deploy.** Esta seção representa o estado atual; os registros cronológicos abaixo preservam as condições e pendências existentes em cada etapa, já superadas quando indicado aqui.

- Aplicação: Assistente Omnilink, projeto Vercel `assistente-show-qymy`, equipe `marcos-marinhos-projects`.
- Produção: https://assistente-show-qymy.vercel.app
- Código publicado: `6081c80e386e62225520dac2322e642fa23c8d8c`, branch `main`, repositório `DevJohn23/assistente-show`.
- Deployment: `dpl_8j6YyK9Mnb7gNZ4bhoavQB2zqDXv`, status READY. Build remoto aprovado em 26 segundos.
- Direção acordada: interface moderna e profissional, prática e sem redundâncias; prioridade para computador, Produtos/Orçamento e Comissões, com adaptação ao celular.
- PRD mantido como referência inicial, não como especificação integral obrigatória. Orçamento Inteligente permanece desabilitado por decisão do usuário.

### Base visual, navegação e dashboard

- Padronização de tipografia, espaçamento, cores, bordas, superfícies, botões, campos, tabelas, cartões, ícones e estados de interação.
- Temas claro, escuro e automático; preferência persistida. Menu lateral expandido/recolhido com controle visível e preferência salva; navegação adaptada ao celular.
- Menu do avatar/nome com Minha conta, tema e saída. Administração exibida para administrador e rota administrativa com verificação de acesso.
- Modais centralizados com fundo desfocado, gerenciamento de foco, Escape, bloqueio de rolagem e prevenção de fechamento durante operações pendentes quando necessário.
- Estados de carregamento, vazio, erro e nova tentativa alinhados ao padrão; falhas de leitura não são apresentadas como dados fictícios ou sucesso.
- Dashboard simplificado: ações de montar orçamento, cadastrar venda e nova oportunidade; indicadores e contatos prioritários. Removidos bloco de próximos vencimentos, gráfico semanal e redundâncias de links/textos.
- Indicadores abrem listas filtradas; resumo mensal considera mês e ano. WhatsApp dos contatos prioritários recebeu o mesmo ícone e realce verde das demais telas.

### Produtos e orçamento — versão final aprovada

- Busca sem acentos, filtros de categorias e kits preservados. Busca e Simular financiamento dividem a primeira linha no desktop; filtros e Kits salvos ficam abaixo. Título visual redundante removido, mantendo identificação para leitores de tela.
- Cartões com imagem horizontal no topo, altura padronizada (140px desktop/130px celular), proporção preservada e fallback para imagem indisponível. Zoom leve de 4% no hover, respeitando preferência por movimento reduzido.
- Botão Adicionar com destaque azul discreto; mensalidade em verde. Após adicionar, botão muda para ✓ Adicionado com transição e não altera novamente a quantidade ao clicar.
- Quantidades concentradas na composição do orçamento; controles por clique, teclado e pressão prolongada. Remover um item ou limpar o orçamento restaura o botão Adicionar.
- Painel de orçamento recolhível no desktop, alinhado ao topo e aproveitando melhor a altura disponível. Cabeçalho/rodapé compactos e corpo rolável; removidos subtítulo e contagem redundante de unidades.
- Prévia da mensagem removida por decisão do usuário. Rodapé mantém totais e cópia direta, confirmada somente após sucesso da área de transferência, com erro e possibilidade de tentar novamente.
- Em telas intermediárias, orçamento abre em modal centralizado; no celular até 640px, em tela inteira. Busca em largura total, simulação na linha seguinte, categorias/kits com quebra de linha, cartões em coluna única e acesso compacto ao orçamento.
- Detalhes do produto, simulador e diálogos de kits seguem o padrão visual. Adição pelos detalhes continua permitindo aumentar unidades.
- Preço manual, restauração do preço original, acréscimo, desconto, mensalidade, entrada de R$ 550, Pix, boleto, cartão e financiamento preservados. Incrementos de 1 ponto percentual e R$ 1; digitação de centavos/decimais permitida.
- Fatores e regras de financiamento preservados. Simulação e mensagem usam o saldo após entrada; saldo negativo após entrada impede copiar a proposta. Simulador aceita valores no formato brasileiro.
- Kits podem ser criados, renomeados, carregados e excluídos. Rascunho local (itens, cliente e condições persistidas) separado por ID de usuário; troca de conta remonta o catálogo. Legado sem proprietário descartado sem afetar kits no banco; indisponibilidade de storage não interrompe o orçamento em memória.

### Comissões e oportunidades

- Comissões: resumo financeiro compacto, tabela com valores alinhados/datas brasileiras, filtros em bloco separado e remoção da legenda redundante de período/Excel.
- Cadastro e edição de venda em modal centralizado, substituindo a proposta inicial de painel lateral. Operação e parceiro contextual, notas, confirmação de exclusão e feedback de falha preservando preenchimento.
- Busca, período, operação, atalhos de mês, paginação e exportação de todos os registros filtrados preservados. Resumo por vendedor expansível; adaptação aos temas e celular.
- Regras de venda própria, implante para outro vendedor e recebimento por implantação de outro preservadas. Corrigido erro prematuro em tentativa duplicada de salvar comissão.
- Oportunidades: filtros separados dos registros, tabela/cartões, datas brasileiras, estados claros, notas, renovação, edição e exclusão em diálogos consistentes. Visualização em cartões denominada Por vencimento.
- Cadastro PF com 15 dias/PJ com 30 dias e renovação a partir do vencimento anterior preservados. Filtros, busca e Excel mantidos; correções de data vazia e envio duplicado.
- WhatsApp com ícone próprio e contorno verde no hover/foco; excluir com realce vermelho. Padrão compartilhado com dashboard e rede técnica.

### Rede técnica e administração

- Rede técnica: busca por endereço/CEP ou nome, categoria aplicada antes da seleção dos cinco mais próximos, lista à esquerda/mapa à direita no desktop e adaptação ao celular.
- Sugestões durante digitação via Photon, com espera de 600ms, cache, cancelamento e teclado; buscas explícitas por endereço e CEP preservadas. Aproximação por cidade identificada quando aplicável.
- Pinos de mapa com categoria/numeração; seleção entre mapa e lista sincronizada. Distâncias em linha reta e indicação Mais próximo, sem implicar avaliação de qualidade.
- Cartões com superfície de maior contraste, contato WhatsApp e rota direta; detalhes, carregamento, falhas, repetição e resultado vazio tratados. Inicialização e redimensionamento do mapa revisados.
- Administração: produtos/técnicos com busca, tabelas e modais no padrão; preservação de categorias/localização existentes e endereço confirmado para novo técnico.
- Formulários bloqueiam envios duplicados, mantêm dados após falha e confirmam sucesso somente com registro retornado. Upload com tratamento de erro; exclusão exige confirmação.

### Perfil, login e recuperação de senha

- Login/cadastro redesenhados, exibição/ocultação de senha, confirmação e validação de nova senha. Senhas novas exigem ao menos oito caracteres; login de conta existente não ganhou essa restrição.
- Minha conta em modal com Dados pessoais e Senha; nome atualizado no Auth. Troca pela conta confirma a senha atual antes da alteração.
- Recuperação por e-mail com rota `/recuperar-senha`; tratamento de link expirado/inválido, sessão de recuperação, recarregamento e callback recebido na raiz ou na mesma aba.
- Primeiro teste real abriu link de localhost no celular e não alcançou o servidor do computador; isso foi identificado como endereço local do dispositivo.
- **Após o deploy, o usuário confirmou que a recuperação de senha funcionou.** Pendência de validação funcional real encerrada. Não foram coletados ou documentados senhas, tokens ou links de recuperação. A configuração completa do painel de Auth não foi inspecionada; a confirmação é do fluxo real executado pelo usuário.

### Confiabilidade, segurança e publicação

- Escritas confirmadas pela resposta do banco, formulários preservados em falha, exclusões sem sucesso falso e bloqueio de submissões repetidas.
- Políticas do Supabase inspecionadas: RLS ativa nas tabelas verificadas; registros comerciais vinculados ao usuário e alterações administrativas restritas. Gestão de imagens de produtos restrita a administradores pela correção anterior documentada.
- Cron semanal exige `Authorization: Bearer` e `CRON_SECRET` em qualquer ambiente; removidos segredo fixo no código, autenticação por URL, fallback para chave pública e destinatário alternativo.
- Sem autenticação válida: 401. Com autenticação, mas sem configuração de URL/chave de serviço/Resend: 503 antes de acessar dados ou enviar e-mail. Cliente Resend criado somente no envio; erros internos não expostos na resposta geral do endpoint.
- Reconexão da conta do plugin Vercel resolveu indisponibilidade das ferramentas e falta de acesso aos projetos/deployments.
- Variáveis necessárias confirmadas por metadados, sem descriptografar valores. Criado `CRON_SECRET` aleatório de 256 bits, sensível e exclusivo de produção; entrou na configuração do novo deployment. `.env.example` atualizado sem segredos.
- Publicação via commit/push da `main`, com exclusões locais prévias dos três KMLs e PDF fora do commit. Nenhuma migração adicional ou disparo manual de relatório foi feito no deploy.

### Validações e continuidade

- TypeScript, build de produção, testes Node e `git diff --check` aprovados nas revisões.
- Sete suítes de navegador aprovadas na revisão geral: navegação/dashboard, catálogo, comissões, oportunidades, conta, rede técnica e administração. Após as últimas correções, repetidas as quatro suítes afetadas: catálogo, regressões gerais, comissões e conta.
- Cobertura inclui cálculos/pagamentos, filtros, Excel, modais, teclado, temas, celular, falhas/repetição, duplicidade, isolamento dos rascunhos e autenticação simulada. Testes automatizados interceptam serviços externos; não comprovam todos os fluxos reais de produção.
- Verificação no domínio publicado: login e ação de recuperação disponíveis, rota sem token rejeitada, cron sem autorização retornando 401 e nenhum erro de execução do navegador nos fluxos públicos testados. Consulta inicial de logs error/fatal do deployment sem ocorrências.
- Recuperação real por e-mail validada pelo usuário. Demais operações autenticadas e envio semanal completo não foram exercitados com dados reais nessa checagem; acompanhar uso normal e relatório agendado.
- Advisor indicou proteção contra senhas vazadas desativada: recomendação de endurecimento ainda não aplicada, sem relação com a reestruturação visual.
- Recursos adicionais e Orçamento Inteligente continuam fora do escopo atual. Documentos detalhados em `docs/implementacao-visual-etapa-1.md` a `docs/implementacao-visual-etapa-7.md` e `docs/revisao-final-pre-deploy.md` registram as etapas históricas.

---

## Publicação em produção — 12/10/2026

- Deploy autorizado pelo usuário, adiando confirmação de recuperação real de senha para depois da publicação.
- Commit `6081c80e386e62225520dac2322e642fa23c8d8c` enviado à `main`; deployment `dpl_8j6YyK9Mnb7gNZ4bhoavQB2zqDXv` concluído como READY em produção.
- Domínio: https://assistente-show-qymy.vercel.app. Build remoto concluído em 26 segundos.
- Smoke test no domínio: login e ação de recuperação presentes; recuperação sem token mostra link inválido; cron sem autenticação retorna 401; nenhum erro de execução no navegador nesses fluxos públicos.
- Consulta inicial de logs error/fatal do deployment não retornou ocorrências; isso não substitui monitoramento contínuo ou teste autenticado real.
- Recuperação de senha posteriormente confirmada pelo usuário no fluxo real após o deploy. Redirecionamentos/Site URL não foram inspecionados diretamente no painel. Não foi enviado e-mail pela automação desta revisão.
- Exclusões locais anteriores de PDF/KML não incluídas no commit de publicação.

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

*Última atualização registrada: 12 de Outubro de 2026 — consolidação da reestruturação publicada e confirmação da recuperação de senha.*
