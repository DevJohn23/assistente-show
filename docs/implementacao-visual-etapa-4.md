# Conta e acesso — etapa 4

11/10/2026. Implementação local; sem publicação ou mudanças de configuração no Supabase.

## Experiência

- Avatar/nome mantém tema e saída e passa a oferecer Minha conta.
- Minha conta abre modal centralizado com Dados pessoais (nome editável e e-mail somente leitura) e Senha (senha atual, nova senha e confirmação).
- Nome atualizado via `auth.updateUser`, sem alterar vendedores parceiros, registros comerciais ou permissões. A interface recebe a atualização pelo evento de autenticação.
- Troca de senha confirma a credencial atual antes de atualizar. Valores de senha são limpos após sucesso, mudança de seção ou fechamento; nunca são gravados pelo formulário em armazenamento local.
- Login redesenhado com a mesma identidade, sem termos de implementação na interface. Cadastro de vendedor existente preservado, com confirmação de senha. Novas senhas têm mínimo de 8 caracteres; o login aceita senhas existentes.
- Esqueci minha senha solicita recuperação e usa resposta neutra quanto à existência do e-mail. Falhas e limites de envio são informados.
- Rota `/recuperar-senha` verifica sessão e contexto de recuperação, trata links inválidos/expirados e permite definir nova senha. O contexto sobrevive à atualização da página na mesma aba e é removido após sucesso ou nova autenticação. A verificação real de sessão e a atualização permanecem sob responsabilidade do Supabase; o marcador local apenas controla a apresentação.
- Eventos PASSWORD_RECOVERY recebidos na raiz também direcionam à tela de recuperação. O SDK continua responsável pela sessão; o modelo de permissões foi preservado. O evento de recuperação é capturado antes da montagem da interface para não perder o callback durante a inicialização.

## Configuração e validação externa pendentes

O plugin conectado não expõe a configuração de URLs de autenticação, e o painel no navegador solicitou login. Não foi possível verificar ou alterar a lista de redirecionamentos. Antes do teste por e-mail, conferir Authentication → URL Configuration no projeto:

- `http://127.0.0.1:3000/recuperar-senha`
- `http://localhost:3000/recuperar-senha` (se usado)
- Após publicação, a URL HTTPS do domínio oficial com `/recuperar-senha`.

Preservar o Site URL de produção e os redirecionamentos existentes. O fluxo usa o template de recuperação já configurado no Supabase, que deve respeitar o link/redirect de confirmação. Entrega e abertura de e-mail real ainda não foram testadas. Nenhuma senha ou conta real foi modificada e nenhum e-mail de teste enviado.

## Referências consultadas

- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- https://supabase.com/docs/reference/javascript/auth-updateuser
- https://supabase.com/docs/guides/auth/password-security
- Changelog oficial consultado; sem mudança incompatível aplicável ao cliente hospedado usado nesta etapa.

## Validação local

TypeScript e suíte específica de conta/autenticação aprovados. Foram verificados: atualização de nome, erro e repetição de envio, senha atual incorreta, divergência de confirmação, troca de senha, login com falha, solicitação de recuperação e limite de envio, cadastro, link expirado, callback válido, atualização da página, consumo do contexto de recuperação, retorno pela raiz e layout de celular. Todas as respostas de autenticação foram simuladas.

Build de produção e suíte geral de regressões também aprovados após os ajustes finais. Capturas de login, perfil e recuperação móvel conferidas.
