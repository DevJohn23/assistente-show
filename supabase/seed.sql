-- =============================================================================
-- SEED DATA - ASSISTENTE SHOW (Produtos Iniciais da Omnilink)
-- =============================================================================

-- Inserir Categorias Padrão
INSERT INTO public.categories (id, name, description) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Rastreamento & Telemetria', 'Equipamentos de rastreamento de alta performance para frotas'),
  ('c2222222-2222-2222-2222-222222222222', 'Gestão de Pneus & Sensores', 'Sensores de pressão e temperatura para monitoramento de pneus'),
  ('c3333333-3333-3333-3333-333333333333', 'Segurança de Carga', 'Sistemas e travas de segurança para baús e cargas valiosas')
ON CONFLICT (name) DO NOTHING;

-- Inserir Produtos Iniciais Omnilink
INSERT INTO public.products (name, category_id, description, default_price, pix_price, monthly_fee, is_active, commercial_rules) VALUES
  (
    'Omniturbo',
    'c1111111-1111-1111-1111-111111111111',
    'Rastreador de alta performance com telemetria avançada e atualização em tempo real.',
    1850.00,
    1690.00,
    89.90,
    true,
    '{"allow_pix": true, "allow_boleto": true, "max_boleto_installments": 3, "allow_card": true, "max_card_installments": 12, "allow_financing": false}'::jsonb
  ),
  (
    'Omnidual',
    'c1111111-1111-1111-1111-111111111111',
    'Rastreador dual chip com dupla comunicação celular para máxima redundância.',
    2200.00,
    1990.00,
    99.90,
    true,
    '{"allow_pix": true, "allow_boleto": true, "max_boleto_installments": 3, "allow_card": true, "max_card_installments": 12, "allow_financing": false}'::jsonb
  ),
  (
    'Omnilora',
    'c1111111-1111-1111-1111-111111111111',
    'Rastreador secundário com frequência LoRa para recuperação em caso de jacto/jammer.',
    1400.00,
    1250.00,
    49.90,
    true,
    '{"allow_pix": true, "allow_boleto": true, "max_boleto_installments": 3, "allow_card": true, "max_card_installments": 12, "allow_financing": false}'::jsonb
  ),
  (
    'Omnicarga',
    'c3333333-3333-3333-3333-333333333333',
    'Isca de carga autonôma com bateria de longa duração para cargas de alto valor.',
    1950.00,
    1750.00,
    69.90,
    true,
    '{"allow_pix": true, "allow_boleto": true, "max_boleto_installments": 3, "allow_card": true, "max_card_installments": 12, "allow_financing": false}'::jsonb
  ),
  (
    'Omnisafe',
    'c3333333-3333-3333-3333-333333333333',
    'Sistema de trava eletrônica de baú e controle de portas via telemetria.',
    2800.00,
    2500.00,
    110.00,
    true,
    '{"allow_pix": true, "allow_boleto": true, "max_boleto_installments": 3, "allow_card": true, "max_card_installments": 12, "allow_financing": false}'::jsonb
  ),
  (
    'Pneu Conectado',
    'c2222222-2222-2222-2222-222222222222',
    'Sistema completo de gestão e monitoramento em tempo real de pressão e temperatura dos pneus.',
    3200.00,
    2800.00,
    120.00,
    true,
    '{"allow_pix": true, "allow_boleto": true, "max_boleto_installments": 3, "allow_card": true, "max_card_installments": 12, "allow_financing": false}'::jsonb
  );
