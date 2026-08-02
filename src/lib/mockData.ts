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
    name: 'Sensor de Temperatura & Umidade',
    category_id: 'cat-2',
    description: 'Sensor sem fio para monitoramento contínuo de baú frigorífico.',
    default_price: 650.00,
    pix_price: 590.00,
    monthly_fee: 15.00,
    image_url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=80',
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
    name: 'Trava de Baú Eletroeletrônica',
    category_id: 'cat-2',
    description: 'Trava de alta segurança com controle de abertura via central ou comando numérico.',
    default_price: 1290.00,
    pix_price: 1150.00,
    monthly_fee: 25.00,
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&auto=format&fit=crop&q=80',
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
    name: 'Teclado de Bordo Inteligente',
    category_id: 'cat-2',
    description: 'Interface de comunicação do motorista com a central com envio de macros e alertas.',
    default_price: 450.00,
    pix_price: 390.00,
    monthly_fee: 10.00,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
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

// No pre-defined sellers; users register their own partner sellers dynamically
export const INITIAL_SELLERS: string[] = [];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    user_id: 'user-1',
    client_name: 'Frota Rodoviária Alfa',
    cpf_cnpj: '12.345.678/0001-90',
    type: 'PJ',
    phone: '11998877665',
    company_name: 'Alfa Logística Ltda',
    registration_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    expiration_date: new Date().toISOString().split('T')[0],
    notes: 'Cliente pediu orçamento para 10 carretas frigoríficas.',
    status: 'active'
  },
  {
    id: 'opp-2',
    user_id: 'user-1',
    client_name: 'Transportes Sul-Minas',
    cpf_cnpj: '98.765.432/0001-10',
    type: 'PJ',
    phone: '35987654321',
    company_name: 'Sul-Minas Cargas',
    registration_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    expiration_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    notes: 'Aguardando aprovação da diretoria para instalação do Omniturbo.',
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
    status: 'pending',
    notes: 'Venda e implantação própria. 100% retido.'
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
