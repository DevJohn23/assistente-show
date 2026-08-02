import { Product, Opportunity, Commission, QuoteTemplate } from '@/types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Omniturbo',
    category_id: 'cat-1',
    description: 'Rastreador de alta performance com telemetria avançada e atualização em tempo real.',
    default_price: 1850.00,
    pix_price: 1690.00,
    monthly_fee: 89.90,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    commercial_rules: {
      allow_pix: true,
      allow_boleto: true,
      max_boleto_installments: 3,
      allow_card: true,
      max_card_installments: 12,
      allow_financing: false
    }
  },
  {
    id: 'prod-2',
    name: 'Omnidual',
    category_id: 'cat-1',
    description: 'Rastreador dual chip com dupla comunicação celular para máxima redundância.',
    default_price: 2200.00,
    pix_price: 1990.00,
    monthly_fee: 99.90,
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    commercial_rules: {
      allow_pix: true,
      allow_boleto: true,
      max_boleto_installments: 3,
      allow_card: true,
      max_card_installments: 12,
      allow_financing: false
    }
  },
  {
    id: 'prod-3',
    name: 'Omnilora',
    category_id: 'cat-1',
    description: 'Rastreador secundário com frequência LoRa para recuperação contra jacto/jammer.',
    default_price: 1400.00,
    pix_price: 1250.00,
    monthly_fee: 49.90,
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    commercial_rules: {
      allow_pix: true,
      allow_boleto: true,
      max_boleto_installments: 3,
      allow_card: true,
      max_card_installments: 12,
      allow_financing: false
    }
  },
  {
    id: 'prod-4',
    name: 'Omnicarga',
    category_id: 'cat-2',
    description: 'Isca de carga autônoma com bateria de longa duração para cargas valiosas.',
    default_price: 1950.00,
    pix_price: 1750.00,
    monthly_fee: 69.90,
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    commercial_rules: {
      allow_pix: true,
      allow_boleto: true,
      max_boleto_installments: 3,
      allow_card: true,
      max_card_installments: 12,
      allow_financing: false
    }
  },
  {
    id: 'prod-5',
    name: 'Omnisafe',
    category_id: 'cat-2',
    description: 'Sistema de trava eletrônica de baú e controle de portas via telemetria.',
    default_price: 2800.00,
    pix_price: 2500.00,
    monthly_fee: 110.00,
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    commercial_rules: {
      allow_pix: true,
      allow_boleto: true,
      max_boleto_installments: 3,
      allow_card: true,
      max_card_installments: 12,
      allow_financing: false
    }
  },
  {
    id: 'prod-6',
    name: 'Pneu Conectado',
    category_id: 'cat-3',
    description: 'Monitoramento em tempo real de pressão e temperatura dos pneus da frota.',
    default_price: 3200.00,
    pix_price: 2800.00,
    monthly_fee: 120.00,
    image_url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    commercial_rules: {
      allow_pix: true,
      allow_boleto: true,
      max_boleto_installments: 3,
      allow_card: true,
      max_card_installments: 12,
      allow_financing: false
    }
  }
];

export const INITIAL_SELLERS: string[] = [
  'Pedro Vendedor',
  'Carlos Vendedor',
  'Luana Silva',
  'Roberto Costa'
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    user_id: 'user-1',
    client_name: 'Transportadora Silva & Filhos',
    cpf_cnpj: '12.345.678/0001-90',
    type: 'PJ',
    phone: '11987654321',
    company_name: 'TransSilva',
    registration_date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
    expiration_date: new Date().toISOString().split('T')[0], // Vence Hoje
    notes: 'Cliente pediu retorno para renovação das 15 licenças.',
    status: 'active'
  },
  {
    id: 'opp-2',
    user_id: 'user-1',
    client_name: 'Carlos Eduardo Oliveira',
    cpf_cnpj: '234.567.890-12',
    type: 'PF',
    phone: '11976543210',
    company_name: '',
    registration_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    expiration_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], // Vence Amanhã
    notes: 'Aguardando aprovação de proposta enviada por WhatsApp.',
    status: 'active'
  },
  {
    id: 'opp-3',
    user_id: 'user-1',
    client_name: 'Express Rápido Logística',
    cpf_cnpj: '98.765.432/0001-10',
    type: 'PJ',
    phone: '21998877665',
    company_name: 'Express Rápido',
    registration_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    expiration_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Vence em 2 dias
    notes: 'Interessado no módulo Pneu Conectado + Omniturbo.',
    status: 'active'
  },
  {
    id: 'opp-4',
    user_id: 'user-1',
    client_name: 'Marcos Roberto Souza',
    cpf_cnpj: '345.678.901-23',
    type: 'PF',
    phone: '31988990011',
    company_name: '',
    registration_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    expiration_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], // Vence esta semana
    notes: 'Renovação anual de rastreador.',
    status: 'active'
  }
];

export const INITIAL_COMMISSIONS: Commission[] = [
  {
    id: 'comm-1',
    user_id: 'user-1',
    client_name: 'Frota Rodoviária Alfa',
    sale_amount: 15400.00,
    commission_amount: 1540.00,
    sale_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    installer_option: 'me',
    registration_type: 'own',
    status: 'paid',
    notes: 'Venda e implantação própria. 100% retido.'
  },
  {
    id: 'comm-2',
    user_id: 'user-1',
    client_name: 'Logística Sul-Minas',
    sale_amount: 8500.00,
    commission_amount: 850.00,
    sale_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    installer_option: 'me',
    other_installer_name: 'Pedro Vendedor',
    registration_type: 'implanted_for_other',
    status: 'pending',
    notes: 'Implantei a venda para o Pedro. A comissão caiu pra mim e preciso REPASSAR R$ 850 para ele.'
  },
  {
    id: 'comm-3',
    user_id: 'user-1',
    client_name: 'Posto & Cargas Boavista',
    sale_amount: 12000.00,
    commission_amount: 1200.00,
    sale_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    installer_option: 'other',
    other_installer_name: 'Carlos Vendedor',
    registration_type: 'other_implanted_for_me',
    status: 'pending',
    notes: 'Carlos implantou minha venda. A comissão caiu na conta dele e tenho R$ 1.200 A RECEBER dele.'
  }
];

export const INITIAL_TEMPLATES: QuoteTemplate[] = [
  {
    id: 'tpl-1',
    user_id: 'user-1',
    name: 'Kit Cavalo Mecânico',
    items: [
      { product_id: 'prod-1', quantity: 1 },
      { product_id: 'prod-3', quantity: 1 },
      { product_id: 'prod-6', quantity: 1 }
    ]
  },
  {
    id: 'tpl-2',
    user_id: 'user-1',
    name: 'Kit Baú & Carga',
    items: [
      { product_id: 'prod-2', quantity: 1 },
      { product_id: 'prod-4', quantity: 1 },
      { product_id: 'prod-5', quantity: 1 }
    ]
  }
];
