# Etapa 6 — Rede técnica

Implementação local em 11/10/2026.

- Busca por endereço/CEP e por nome/categoria/parceiro sempre acessível; busca textual sem acentos.
- Pesquisa geográfica explícita pelo botão Buscar ou Enter; quando há mais de um endereço, usuário escolhe a opção. Evita chamadas geográficas a cada tecla e seleção silenciosa do primeiro resultado.
- Categoria aplicada antes da classificação dos cinco mais próximos; mantém distância Haversine em linha reta.
- Lista à esquerda e mapa à direita no desktop. No celular, mapa acima dos resultados.
- Cartões com distância, selo Mais próximo, WhatsApp e rota; detalhes no próprio cartão, sem modal.
- Seleção sincronizada, reenquadramento dos resultados, legenda recolhida e marcador distinto do cliente.
- Carregamento/erro/repetição para leitura da rede, erro ou ausência de endereço e aviso quando o CEP resolve apenas para a cidade.
- Cancelamento de busca e endereço reverso antigos; mapa aguarda inicialização antes de desenhar marcadores e acompanha mudanças de tamanho.
- CSS do Leaflet servido pelo pacote local. Textos de técnicos em tooltips usam textContent, sem inserir dados como HTML.

## Limites

Sem alteração de tabelas, políticas, autenticação, registros, orçamento ou comissões. Sem deploy. Distância não estima percurso, disponibilidade ou qualidade. Serviços externos ViaCEP e OpenStreetMap permanecem dependências; rota abre Google Maps e contato abre WhatsApp, sem envio automático.

## Verificação

- TypeScript (`npx tsc --noEmit`), build de produção (`npm run build`), regressões (`npm test`) e `git diff --check`: aprovados.
- `tests/technical-network-browser.cjs`: leitura com falha/repetição, cinco mais próximos, filtro antes do ranking, mapa/lista, WhatsApp e rota, CEP aproximado, escolha entre endereços, ausência/falha/repetição, nome sem acentos/parceiro, temas e celular: aprovado, zero escritas e zero erros de execução.
- `tests/browser-regressions.cjs`: dashboard, navegação/tema, comissões, oportunidades, kits, falha de leitura, administrador e saída: aprovado.
- Capturas desktop claro/escuro e celular revisadas. Mapa usa tiles simulados no teste; chamadas externas interceptadas não comprovam disponibilidade em tempo real dos provedores.
- Servidor local reiniciado após compilação. Nenhuma publicação.

Referência de leitura de dados: https://supabase.com/docs/reference/javascript/select (tratamento de data/error). Checklist React: limpeza de efeitos, cancelamento, estado derivado, acessibilidade e carregamento dinâmico.

## Refinamento — 12/10/2026

- Sugestões durante digitação (mínimo de quatro caracteres, pausa de 600 ms), cache em memória limitado, cancelamento ao editar/limpar/sair e teclado com setas, Enter e Escape.
- Photon fornece autocomplete restrito ao Brasil. Nominatim permanece na busca explícita e endereço reverso; não é usado para autocomplete, conforme https://operations.osmfoundation.org/policies/nominatim/.
- Referência Photon: https://github.com/komoot/photon e docs/api-v1.md. Instância pública permite uso moderado, sem garantia de disponibilidade; falha de sugestões orienta usar Buscar. Consulta real de Avenida Paulista retornou resultados de São Paulo.
- Pinos SVG com categoria, números e destaque de seleção; cliente permanece com marcador distinto. Mapa mantido à direita.

- Validação: TypeScript, diff check e suíte da Rede técnica com autocomplete/teclado/pinos aprovados; capturas revisadas.

### Superfícies e ações de contato — 12/10/2026

- Cartões com superfície própria e hover sutil nos dois temas; seleção azul preservada.
- Ícone WhatsApp compartilhado entre Rede técnica e Oportunidades; na rede, texto/contorno verde e hover suave.
- Em Oportunidades, hover e foco do WhatsApp verdes; exclusão vermelha. Aplica-se à tabela e aos cartões, sem alterar links ou operações.
