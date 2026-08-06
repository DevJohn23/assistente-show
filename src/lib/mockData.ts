import { Product, Opportunity, Commission, QuoteTemplate } from '@/types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'OMNITURBO (Kit Omniturbo)',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNITURBO (Kit Omniturbo).',
    default_price: 6930.00,
    pix_price: 6930.00,
    monthly_fee: 205.86,
    image_url: '/products/prod-img-1.jpg',
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
    name: 'OMNIDUAL',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNIDUAL.',
    default_price: 4830.00,
    pix_price: 4830.00,
    monthly_fee: 130.60,
    image_url: '/products/prod-img-2.jpg',
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
    name: 'OMNICARGA 2G + GPS DESCARTÁVEL',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNICARGA 2G + GPS DESCARTÁVEL.',
    default_price: 275.25,
    pix_price: 275.25,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-3.jpg',
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
    name: 'OMNIMOB - KIT COMPLETO',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNIMOB - KIT COMPLETO.',
    default_price: 2236.06,
    pix_price: 2236.06,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-4.jpg',
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
    name: 'OMNISAFE - DASHCAM 4CH',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNISAFE - DASHCAM 4CH.',
    default_price: 4189.50,
    pix_price: 4189.50,
    monthly_fee: 130.00,
    image_url: '/products/prod-img-5.jpg',
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
    name: 'OMNILORA',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNILORA.',
    default_price: 756.00,
    pix_price: 756.00,
    monthly_fee: 20.00,
    image_url: '/products/prod-img-6.jpg',
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
    id: 'prod-7',
    name: 'OMNIDUAL + OMNILORA',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNIDUAL + OMNILORA.',
    default_price: 5563.95,
    pix_price: 5563.95,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-7.jpg',
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
    id: 'prod-8',
    name: 'OMNITURBO + OMNILORA',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNITURBO + OMNILORA.',
    default_price: 7663.95,
    pix_price: 7663.95,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-8.jpg',
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
    id: 'prod-9',
    name: 'OMNICARGA 4G + GPS DESCARTÁVEL',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNICARGA 4G + GPS DESCARTÁVEL.',
    default_price: 309.75,
    pix_price: 309.75,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-9.jpg',
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
    id: 'prod-10',
    name: 'OMNICARGA 4G + GPS + IMÃ DESCARTÁVEL',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNICARGA 4G + GPS + IMÃ DESCARTÁVEL.',
    default_price: 309.75,
    pix_price: 309.75,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-10.jpg',
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
    id: 'prod-11',
    name: 'OMNICARGA 2G + GPS + IMÃ DESCARTÁVEL',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNICARGA 2G + GPS + IMÃ DESCARTÁVEL.',
    default_price: 257.25,
    pix_price: 257.25,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-11.jpg',
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
    id: 'prod-12',
    name: 'OMNICARRETA',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNICARRETA.',
    default_price: 1260.00,
    pix_price: 1260.00,
    monthly_fee: 59.00,
    image_url: '/products/prod-img-12.jpg',
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
    id: 'prod-13',
    name: 'OMNITURBO SEM TECLADO',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNITURBO SEM TECLADO.',
    default_price: 5880.00,
    pix_price: 5880.00,
    monthly_fee: 205.86,
    image_url: '/products/prod-img-13.jpg',
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
    id: 'prod-14',
    name: 'OMNIDUAL SEM TECLADO',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNIDUAL SEM TECLADO.',
    default_price: 3780.00,
    pix_price: 3780.00,
    monthly_fee: 130.60,
    image_url: '/products/prod-img-14.jpg',
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
    id: 'prod-15',
    name: 'OMNISAFE PLUS MDVR 4CH I.A',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNISAFE PLUS MDVR 4CH I.A.',
    default_price: 5517.75,
    pix_price: 5517.75,
    monthly_fee: 130.00,
    image_url: '/products/prod-img-15.jpg',
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
    id: 'prod-16',
    name: 'OMNICARGA 4G LORA COM GPS LI0650 DESCARTÁVEL',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNICARGA 4G LORA COM GPS LI0650 DESCARTÁVEL.',
    default_price: 330.75,
    pix_price: 330.75,
    monthly_fee: 20.00,
    image_url: '/products/prod-img-16.jpg',
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
    id: 'prod-17',
    name: 'OMNICARGA 4G LORA COM GPS LI0650 - RETORNÁVEL',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNICARGA 4G LORA COM GPS LI0650 - RETORNÁVEL.',
    default_price: 99.00,
    pix_price: 99.00,
    monthly_fee: 20.00,
    image_url: '/products/prod-img-17.jpg',
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
    id: 'prod-18',
    name: 'OMNISAFE PLUS MDVR 8CH I.A',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNISAFE PLUS MDVR 8CH I.A.',
    default_price: 6126.75,
    pix_price: 6126.75,
    monthly_fee: 130.00,
    image_url: '/products/prod-img-18.jpg',
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
    id: 'prod-19',
    name: 'Urbano Omnicarreta',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — Urbano Omnicarreta.',
    default_price: 474.00,
    pix_price: 474.00,
    monthly_fee: 59.00,
    image_url: '/products/prod-img-19.jpg',
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
    id: 'prod-20',
    name: 'OMNICARGA 4G + GPS + IMA RETORNÁVEL 12 meses',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNICARGA 4G + GPS + IMA RETORNÁVEL 12 meses.',
    default_price: 103.95,
    pix_price: 103.95,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-20.jpg',
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
    id: 'prod-21',
    name: 'OMNICARGA 4G + GPS RETORNAVEL - 12 meses',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNICARGA 4G + GPS RETORNAVEL - 12 meses.',
    default_price: 103.95,
    pix_price: 103.95,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-21.jpg',
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
    id: 'prod-22',
    name: 'OMNITURBO SEM TECLADO (BAU BLINDADO)',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNITURBO SEM TECLADO (BAU BLINDADO).',
    default_price: 6762.00,
    pix_price: 6762.00,
    monthly_fee: 205.86,
    image_url: '/products/prod-img-22.jpg',
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
    id: 'prod-23',
    name: 'OMNICARRETA COM PLACA SOLAR',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNICARRETA COM PLACA SOLAR.',
    default_price: 1600.00,
    pix_price: 1600.00,
    monthly_fee: 59.00,
    image_url: '/products/prod-img-23.jpg',
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
    id: 'prod-24',
    name: 'Pneu Conectado 295/80R22.5 OT321',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — Pneu Conectado 295/80R22.5 OT321.',
    default_price: 3200.00,
    pix_price: 3200.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-24.jpg',
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
    id: 'prod-25',
    name: 'OMNITPMS',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNITPMS.',
    default_price: 990.00,
    pix_price: 990.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-25.jpg',
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
    id: 'prod-26',
    name: 'TRAVA DE QUINTA RODA E.LOCK',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — TRAVA DE QUINTA RODA E.LOCK.',
    default_price: 3700.00,
    pix_price: 3700.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-26.jpg',
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
    id: 'prod-27',
    name: 'OMNICARGA 4G LORA COM GPS COM IMÃ LI0650 DESCARTÁVEL',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNICARGA 4G LORA COM GPS COM IMÃ LI0650 DESCARTÁVEL.',
    default_price: 330.75,
    pix_price: 330.75,
    monthly_fee: 20.00,
    image_url: '/products/prod-img-27.jpg',
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
    id: 'prod-28',
    name: 'OMNITURBO - LT',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNITURBO - LT.',
    default_price: 6930.00,
    pix_price: 6930.00,
    monthly_fee: 205.86,
    image_url: '/products/prod-img-28.jpg',
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
    id: 'prod-29',
    name: 'OMNITURBO - LT SEM TECLADO',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNITURBO - LT SEM TECLADO.',
    default_price: 5880.00,
    pix_price: 5880.00,
    monthly_fee: 205.86,
    image_url: '/products/prod-img-29.jpg',
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
    id: 'prod-30',
    name: 'OMNISAFE - DASHCAM 5CH (ADAS + DSM + 1 câm. interna e 2 externas)',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNISAFE - DASHCAM 5CH (ADAS + DSM + 1 câm. interna e 2 externas).',
    default_price: 6448.53,
    pix_price: 6448.53,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-30.jpg',
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
    id: 'prod-31',
    name: 'OMNISAFE - DASHCAM 5CH (ADAS + DSM)',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNISAFE - DASHCAM 5CH (ADAS + DSM).',
    default_price: 5094.02,
    pix_price: 5094.02,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-31.jpg',
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
    id: 'prod-32',
    name: 'OMNIDUAL - RI7454 - TESTES',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNIDUAL - RI7454 - TESTES.',
    default_price: 4830.00,
    pix_price: 4830.00,
    monthly_fee: 130.60,
    image_url: '/products/prod-img-32.jpg',
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
    id: 'prod-33',
    name: 'OMNITURBO - RI7484 - TESTES',
    category_id: 'cat-1',
    description: 'Equipamento rastreador e controlador de frota Omnilink — OMNITURBO - RI7484 - TESTES.',
    default_price: 6930.00,
    pix_price: 6930.00,
    monthly_fee: 205.86,
    image_url: '/products/prod-img-33.jpg',
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
    id: 'prod-34',
    name: 'CJ. CONEXÃO CAVALO (CHICOTE ESPIRAL) P&P',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ. CONEXÃO CAVALO (CHICOTE ESPIRAL) P&P.',
    default_price: 487.20,
    pix_price: 487.20,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-34.jpg',
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
    id: 'prod-35',
    name: 'TOMADA DE CONEXÃO DE CARRETA P&P',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — TOMADA DE CONEXÃO DE CARRETA P&P.',
    default_price: 260.40,
    pix_price: 260.40,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-35.jpg',
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
    id: 'prod-36',
    name: 'CJ TRAVA BAÚ - P. TRASEIRA DUPLA',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ TRAVA BAÚ - P. TRASEIRA DUPLA.',
    default_price: 1504.65,
    pix_price: 1504.65,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-36.jpg',
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
    id: 'prod-37',
    name: 'SENSOR DE ENGATE E DESENGATE ELETRÔNICO',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — SENSOR DE ENGATE E DESENGATE ELETRÔNICO.',
    default_price: 243.60,
    pix_price: 243.60,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-37.jpg',
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
    id: 'prod-38',
    name: 'CONJUNTO DE SENSOR DE PORTA DE BAÚ',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CONJUNTO DE SENSOR DE PORTA DE BAÚ.',
    default_price: 408.45,
    pix_price: 408.45,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-38.jpg',
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
    id: 'prod-39',
    name: 'CONJUNTO DE SENSOR DE PORTA DE BAÚ ADICIONAL',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CONJUNTO DE SENSOR DE PORTA DE BAÚ ADICIONAL.',
    default_price: 408.45,
    pix_price: 408.45,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-39.jpg',
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
    id: 'prod-40',
    name: 'CJ TRAVA CARRETA FRIGORÍFICA - P. TRASEIRA',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ TRAVA CARRETA FRIGORÍFICA - P. TRASEIRA.',
    default_price: 1871.10,
    pix_price: 1871.10,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-40.jpg',
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
    id: 'prod-41',
    name: 'CJ TRAVA CARRETA - P. TRASEIRA ROLL UP',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ TRAVA CARRETA - P. TRASEIRA ROLL UP.',
    default_price: 1304.10,
    pix_price: 1304.10,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-41.jpg',
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
    id: 'prod-42',
    name: 'CJ TRAVA BAÚ - P. TRASEIRA ROLL UP',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ TRAVA BAÚ - P. TRASEIRA ROLL UP.',
    default_price: 1462.65,
    pix_price: 1462.65,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-42.jpg',
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
    id: 'prod-43',
    name: 'CJ TRAVA BAÚ - P. LATERAL',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ TRAVA BAÚ - P. LATERAL.',
    default_price: 1554.00,
    pix_price: 1554.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-43.jpg',
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
    id: 'prod-44',
    name: 'CJ - SENSOR DE TEMPERATURA INOX ADICIONAL',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ - SENSOR DE TEMPERATURA INOX ADICIONAL.',
    default_price: 475.00,
    pix_price: 475.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-44.jpg',
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
    id: 'prod-45',
    name: 'CJ TRAVA ELETROMAG. VAN - P. LATERAL',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ TRAVA ELETROMAG. VAN - P. LATERAL.',
    default_price: 1000.65,
    pix_price: 1000.65,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-45.jpg',
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
    id: 'prod-46',
    name: 'CJ TRAVA BAÚ - P. TRASEIRA PLATAFORMA',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ TRAVA BAÚ - P. TRASEIRA PLATAFORMA.',
    default_price: 1748.25,
    pix_price: 1748.25,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-46.jpg',
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
    id: 'prod-47',
    name: 'CABO ADAPTADOR TERMINAL 5020',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CABO ADAPTADOR TERMINAL 5020.',
    default_price: 15.75,
    pix_price: 15.75,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-47.jpg',
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
    id: 'prod-48',
    name: 'ARIETE DA QUINTA RODA JOST',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — ARIETE DA QUINTA RODA JOST.',
    default_price: 291.90,
    pix_price: 291.90,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-48.jpg',
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
    id: 'prod-49',
    name: 'ARIETE DA QUINTA RODA FONTAINE',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — ARIETE DA QUINTA RODA FONTAINE.',
    default_price: 316.05,
    pix_price: 316.05,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-49.jpg',
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
    id: 'prod-50',
    name: 'TRAVA QUINTA RODA HÍBRIDA JOST/FONTAINE - 24V',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — TRAVA QUINTA RODA HÍBRIDA JOST/FONTAINE - 24V.',
    default_price: 1278.90,
    pix_price: 1278.90,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-50.jpg',
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
    id: 'prod-51',
    name: 'ADESIVO LATERAL OMNILINK 215X265MM',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — ADESIVO LATERAL OMNILINK 215X265MM.',
    default_price: 6.00,
    pix_price: 6.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-51.jpg',
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
    id: 'prod-52',
    name: 'BATENTE CANTONEIRA',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BATENTE CANTONEIRA.',
    default_price: 27.00,
    pix_price: 27.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-52.jpg',
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
    id: 'prod-53',
    name: 'BATENTE CANTONEIRA - MP - CJ TE',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BATENTE CANTONEIRA - MP - CJ TE.',
    default_price: 27.00,
    pix_price: 27.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-53.jpg',
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
    id: 'prod-54',
    name: 'BATENTE DE ENCAIXE MT PEQ',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BATENTE DE ENCAIXE MT PEQ.',
    default_price: 29.00,
    pix_price: 29.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-54.jpg',
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
    id: 'prod-55',
    name: 'BATENTE DE ENCAIXE MT PEQ - MP',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BATENTE DE ENCAIXE MT PEQ - MP.',
    default_price: 86.00,
    pix_price: 86.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-55.jpg',
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
    id: 'prod-56',
    name: 'BATENTE PL CORRER SPRINTER',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BATENTE PL CORRER SPRINTER.',
    default_price: 130.00,
    pix_price: 130.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-56.jpg',
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
    id: 'prod-57',
    name: 'BATENTE UNIVERSAL - MP - CJ TE',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BATENTE UNIVERSAL - MP - CJ TE.',
    default_price: 43.00,
    pix_price: 43.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-57.jpg',
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
    id: 'prod-58',
    name: 'CJ - SENSOR DE TEMPERATURA INOX',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ - SENSOR DE TEMPERATURA INOX.',
    default_price: 408.45,
    pix_price: 408.45,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-58.jpg',
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
    id: 'prod-59',
    name: 'BLOQUEADOR TIPO 1 FULL-RANGE',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BLOQUEADOR TIPO 1 FULL-RANGE.',
    default_price: 521.85,
    pix_price: 521.85,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-59.jpg',
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
    id: 'prod-60',
    name: 'CJ MULTI SENSOR DE UMIDADE + TEMPERATURA C/ CERTIFICADO',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ MULTI SENSOR DE UMIDADE + TEMPERATURA C/ CERTIFICADO.',
    default_price: 1347.15,
    pix_price: 1347.15,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-60.jpg',
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
    id: 'prod-61',
    name: 'CONJUNTO 02 SENSORES DE PAINEL',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CONJUNTO 02 SENSORES DE PAINEL.',
    default_price: 164.85,
    pix_price: 164.85,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-61.jpg',
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
    id: 'prod-62',
    name: 'CJ SENSOR ADICIONAL PORTA DE BAÚ',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ SENSOR ADICIONAL PORTA DE BAÚ.',
    default_price: 371.55,
    pix_price: 371.55,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-62.jpg',
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
    id: 'prod-63',
    name: 'CJ SENSOR DE TEMPERATURA INOX C/ CERTIFICADO',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ SENSOR DE TEMPERATURA INOX C/ CERTIFICADO.',
    default_price: 731.10,
    pix_price: 731.10,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-63.jpg',
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
    id: 'prod-64',
    name: 'CJ MULTI SENSOR DE UMIDADE + TEMPERATURA',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ MULTI SENSOR DE UMIDADE + TEMPERATURA.',
    default_price: 1116.15,
    pix_price: 1116.15,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-64.jpg',
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
    id: 'prod-65',
    name: 'CJ SENSOR DE UMIDADE + TEMPERATURA',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ SENSOR DE UMIDADE + TEMPERATURA.',
    default_price: 1283.00,
    pix_price: 1283.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-65.jpg',
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
    id: 'prod-66',
    name: 'CJ TRAVA CARRETA - P. TRASEIRA DUPLA',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ TRAVA CARRETA - P. TRASEIRA DUPLA.',
    default_price: 1504.65,
    pix_price: 1504.65,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-66.jpg',
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
    id: 'prod-67',
    name: 'CJ TRAVA ELETROMAG. VAN - P. TRASEIRA',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ TRAVA ELETROMAG. VAN - P. TRASEIRA.',
    default_price: 1040.55,
    pix_price: 1040.55,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-67.jpg',
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
    id: 'prod-68',
    name: 'CJ ACIONAMENTO TRAVA MOTORIZADA INOX',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ ACIONAMENTO TRAVA MOTORIZADA INOX.',
    default_price: 661.50,
    pix_price: 661.50,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-68.jpg',
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
    id: 'prod-69',
    name: 'CHICOTE RELE ACIONAMENTO ESPECIAL',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CHICOTE RELE ACIONAMENTO ESPECIAL.',
    default_price: 280.35,
    pix_price: 280.35,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-69.jpg',
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
    id: 'prod-70',
    name: 'BOTÃO TRAVA DE BAÚ',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BOTÃO TRAVA DE BAÚ.',
    default_price: 92.40,
    pix_price: 92.40,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-70.jpg',
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
    id: 'prod-71',
    name: 'SUPORTE TRAVA DE SOBREPOR',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — SUPORTE TRAVA DE SOBREPOR.',
    default_price: 39.00,
    pix_price: 39.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-71.jpg',
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
    id: 'prod-72',
    name: 'SUPORTE TRAVA DE SOBREPOR - MP - CJ TE',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — SUPORTE TRAVA DE SOBREPOR - MP - CJ TE.',
    default_price: 59.00,
    pix_price: 59.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-72.jpg',
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
    id: 'prod-73',
    name: 'TAMPA CX TRAVA ELETROMAG. (CJ)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — TAMPA CX TRAVA ELETROMAG. (CJ).',
    default_price: 38.00,
    pix_price: 38.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-73.jpg',
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
    id: 'prod-74',
    name: 'TAMPA SUPORTE TRAVA SOBREPOR - MP - CJ TE',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — TAMPA SUPORTE TRAVA SOBREPOR - MP - CJ TE.',
    default_price: 27.00,
    pix_price: 27.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-74.jpg',
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
    id: 'prod-75',
    name: 'BASE DE REFORÇO PL SPRINTER',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BASE DE REFORÇO PL SPRINTER.',
    default_price: 18.00,
    pix_price: 18.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-75.jpg',
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
    id: 'prod-76',
    name: 'BASE REFORÇO MOT PEQ PORTA BAÚ - MP - CJ',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BASE REFORÇO MOT PEQ PORTA BAÚ - MP - CJ.',
    default_price: 86.00,
    pix_price: 86.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-76.jpg',
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
    id: 'prod-77',
    name: 'BASE REFORÇO PORTA BAÚ MOTORIZADA - MP - CJ TM',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BASE REFORÇO PORTA BAÚ MOTORIZADA - MP - CJ TM.',
    default_price: 86.00,
    pix_price: 86.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-77.jpg',
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
    id: 'prod-78',
    name: 'BASE REFORÇO PORTA BAÚ SOLENOIDE - MP - CJ TE',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BASE REFORÇO PORTA BAÚ SOLENOIDE - MP - CJ TE.',
    default_price: 49.00,
    pix_price: 49.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-78.jpg',
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
    id: 'prod-79',
    name: 'CX TRAVA ELETROMAGNETICA (CJ)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CX TRAVA ELETROMAGNETICA (CJ).',
    default_price: 85.05,
    pix_price: 85.05,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-79.jpg',
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
    id: 'prod-80',
    name: 'ESPAÇADOR DE TRAVA BAÚ ORIGINAL (213X170X10)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — ESPAÇADOR DE TRAVA BAÚ ORIGINAL (213X170X10).',
    default_price: 86.00,
    pix_price: 86.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-80.jpg',
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
    id: 'prod-81',
    name: 'ESPAÇADOR DE TRAVA BAÚ ORIGINAL (213X170X15)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — ESPAÇADOR DE TRAVA BAÚ ORIGINAL (213X170X15).',
    default_price: 86.00,
    pix_price: 86.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-81.jpg',
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
    id: 'prod-82',
    name: 'ESPAÇADOR DE TRAVA BAÚ ORIGINAL (213X170X25)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — ESPAÇADOR DE TRAVA BAÚ ORIGINAL (213X170X25).',
    default_price: 58.00,
    pix_price: 58.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-82.jpg',
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
    id: 'prod-83',
    name: 'TRAVA MOTORIZADA UNIVERSAL PEQ. CONTR. INTERN',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — TRAVA MOTORIZADA UNIVERSAL PEQ. CONTR. INTERN.',
    default_price: 683.55,
    pix_price: 683.55,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-83.jpg',
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
    id: 'prod-84',
    name: 'TRAVA ELETROMAGNETICA BIVOLT',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — TRAVA ELETROMAGNETICA BIVOLT.',
    default_price: 862.05,
    pix_price: 862.05,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-84.jpg',
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
    id: 'prod-85',
    name: 'CJ BLOQUEADOR DE COMBUSTIVEL STANDARD',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ BLOQUEADOR DE COMBUSTIVEL STANDARD.',
    default_price: 847.35,
    pix_price: 847.35,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-85.jpg',
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
    id: 'prod-86',
    name: 'MÓDULO DE COMUNICAÇÃO 4G (MODULO SOMENTE 44XX)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — MÓDULO DE COMUNICAÇÃO 4G (MODULO SOMENTE 44XX).',
    default_price: 2800.00,
    pix_price: 2800.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-86.jpg',
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
    id: 'prod-87',
    name: 'ANTENA SATELITE',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — ANTENA SATELITE.',
    default_price: 3061.80,
    pix_price: 3061.80,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-87.jpg',
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
    id: 'prod-88',
    name: 'TECLADO TVC200',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — TECLADO TVC200.',
    default_price: 1050.00,
    pix_price: 1050.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-88.jpg',
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
    id: 'prod-89',
    name: 'SUPORTE TERM ALFANUMERICO 5020',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — SUPORTE TERM ALFANUMERICO 5020.',
    default_price: 139.65,
    pix_price: 139.65,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-1.jpg',
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
    id: 'prod-90',
    name: 'CAMERA EXTERNA DASHCAM 720P OMNI-ES-WB720ES',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CAMERA EXTERNA DASHCAM 720P OMNI-ES-WB720ES.',
    default_price: 249.38,
    pix_price: 249.38,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-2.jpg',
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
    id: 'prod-91',
    name: 'CABO EXTENSOR PARA CAMERAS OMNISAFE BLINDADO 8MT',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CABO EXTENSOR PARA CAMERAS OMNISAFE BLINDADO 8MT.',
    default_price: 136.50,
    pix_price: 136.50,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-3.jpg',
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
    id: 'prod-92',
    name: 'CABO EXTENSOR PARA CAMERAS OMNISAFE BLINDADO 5MT',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CABO EXTENSOR PARA CAMERAS OMNISAFE BLINDADO 5MT.',
    default_price: 115.50,
    pix_price: 115.50,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-4.jpg',
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
    id: 'prod-93',
    name: 'CAMERA INTERNA MDVR 720P Omni-RM-WP720RM',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CAMERA INTERNA MDVR 720P Omni-RM-WP720RM.',
    default_price: 236.25,
    pix_price: 236.25,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-5.jpg',
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
    id: 'prod-94',
    name: 'CAMERA INTERNA DASHCAM 720P OMNI-RM-WP720RM',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CAMERA INTERNA DASHCAM 720P OMNI-RM-WP720RM.',
    default_price: 236.25,
    pix_price: 236.25,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-6.jpg',
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
    id: 'prod-95',
    name: 'CAMERA INTERNA MDVR 1080P Omni-RM-WP1080RM',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CAMERA INTERNA MDVR 1080P Omni-RM-WP1080RM.',
    default_price: 404.25,
    pix_price: 404.25,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-7.jpg',
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
    id: 'prod-96',
    name: 'CHICOTE INSTALACAO PADRAO RI4450ME/MM',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CHICOTE INSTALACAO PADRAO RI4450ME/MM.',
    default_price: 400.00,
    pix_price: 400.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-8.jpg',
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
    id: 'prod-97',
    name: 'TERMINAL ALFANUMERICO 5020 (CINZA)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — TERMINAL ALFANUMERICO 5020 (CINZA).',
    default_price: 1275.75,
    pix_price: 1275.75,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-9.jpg',
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
    id: 'prod-98',
    name: 'SENSOR DE PORTA MAGNÉTICO INVISIVEL (UNIDADE)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — SENSOR DE PORTA MAGNÉTICO INVISIVEL (UNIDADE).',
    default_price: 47.25,
    pix_price: 47.25,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-10.jpg',
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
    id: 'prod-99',
    name: 'SENSOR DE TEMPERATURA C/ 3 FIOS DE 15M',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — SENSOR DE TEMPERATURA C/ 3 FIOS DE 15M.',
    default_price: 270.00,
    pix_price: 270.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-11.jpg',
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
    id: 'prod-100',
    name: 'RELE AUXILIAR NA/NF 12V',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — RELE AUXILIAR NA/NF 12V.',
    default_price: 39.00,
    pix_price: 39.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-12.jpg',
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
    id: 'prod-101',
    name: 'PERFIL U 15X57 PVC SEMI-RIGIDO (1M)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — PERFIL U 15X57 PVC SEMI-RIGIDO (1M).',
    default_price: 12.60,
    pix_price: 12.60,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-13.jpg',
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
    id: 'prod-102',
    name: 'SUPORTE RELE DUPLO DIODO COM FUSIVEL 15A',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — SUPORTE RELE DUPLO DIODO COM FUSIVEL 15A.',
    default_price: 19.95,
    pix_price: 19.95,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-14.jpg',
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
    id: 'prod-103',
    name: 'KIT BLOQUEIO OMNISAFE',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — KIT BLOQUEIO OMNISAFE.',
    default_price: 324.00,
    pix_price: 324.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-15.jpg',
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
    id: 'prod-104',
    name: 'DASHCAM 4H I.A.',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — DASHCAM 4H I.A..',
    default_price: 4074.00,
    pix_price: 4074.00,
    monthly_fee: 130.00,
    image_url: '/products/prod-img-16.jpg',
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
    id: 'prod-105',
    name: 'CAMERA EXTERNA MDVR 1080P Omni-ES-WB1080ES',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CAMERA EXTERNA MDVR 1080P Omni-ES-WB1080ES.',
    default_price: 420.00,
    pix_price: 420.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-17.jpg',
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
    id: 'prod-106',
    name: 'CAMERA INTERNA MDVR 1080P Omni-RM-WP1080RM',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CAMERA INTERNA MDVR 1080P Omni-RM-WP1080RM.',
    default_price: 410.00,
    pix_price: 410.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-18.jpg',
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
    id: 'prod-107',
    name: 'CAMERA INTERNA DASHCAM 720P OMNI-RM-WP720RM',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CAMERA INTERNA DASHCAM 720P OMNI-RM-WP720RM.',
    default_price: 236.25,
    pix_price: 236.25,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-19.jpg',
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
    id: 'prod-108',
    name: 'MNT – MODULO DASHCAM T5504',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — MNT – MODULO DASHCAM T5504.',
    default_price: 1900.00,
    pix_price: 1900.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-20.jpg',
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
    id: 'prod-109',
    name: 'CONJUNTO CAVALO CARRETA OMNISAFE 4 CAMERAS',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CONJUNTO CAVALO CARRETA OMNISAFE 4 CAMERAS.',
    default_price: 816.90,
    pix_price: 816.90,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-21.jpg',
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
    id: 'prod-110',
    name: 'MONITOR INTERNO OMNISAFE MDVR 7 POLEGADAS',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — MONITOR INTERNO OMNISAFE MDVR 7 POLEGADAS.',
    default_price: 684.00,
    pix_price: 684.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-22.jpg',
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
    id: 'prod-111',
    name: 'CHICOTE ESP. SEN. CARRETA (CJ)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CHICOTE ESP. SEN. CARRETA (CJ).',
    default_price: 469.35,
    pix_price: 469.35,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-23.jpg',
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
    id: 'prod-112',
    name: 'SIRENE BI-VOLT (120 DB - 6 TONS)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — SIRENE BI-VOLT (120 DB - 6 TONS).',
    default_price: 43.05,
    pix_price: 43.05,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-24.jpg',
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
    id: 'prod-113',
    name: 'SENSOR PORTA CAB. MAG. POL. INVERTIDA',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — SENSOR PORTA CAB. MAG. POL. INVERTIDA.',
    default_price: 85.05,
    pix_price: 85.05,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-25.jpg',
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
    id: 'prod-114',
    name: 'OMNISAFE - SENSOR DE BAFOMETRO',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — OMNISAFE - SENSOR DE BAFOMETRO.',
    default_price: 956.34,
    pix_price: 956.34,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-26.jpg',
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
    id: 'prod-115',
    name: 'CONTROLADOR DE TRAVA MOTORIZ. TURBO',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CONTROLADOR DE TRAVA MOTORIZ. TURBO.',
    default_price: 578.55,
    pix_price: 578.55,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-27.jpg',
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
    id: 'prod-116',
    name: 'SENSOR CABINE CONTATO - MR - CJ RASTREADOR',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — SENSOR CABINE CONTATO - MR - CJ RASTREADOR.',
    default_price: 19.95,
    pix_price: 19.95,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-28.jpg',
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
    id: 'prod-117',
    name: 'SENSOR MOVIMENTO PLATAFORMA',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — SENSOR MOVIMENTO PLATAFORMA.',
    default_price: 241.88,
    pix_price: 241.88,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-29.jpg',
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
    id: 'prod-118',
    name: 'SENSOR MOVIMENTO PLATAFORMA - MP - CJ TE PLAT',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — SENSOR MOVIMENTO PLATAFORMA - MP - CJ TE PLAT.',
    default_price: 266.70,
    pix_price: 266.70,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-30.jpg',
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
    id: 'prod-119',
    name: 'CARTAO SD 512GB - MDVR',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CARTAO SD 512GB - MDVR.',
    default_price: 1800.00,
    pix_price: 1800.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-31.jpg',
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
    id: 'prod-120',
    name: 'CARTAO MICROSD 512GB - DASHCAM',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CARTAO MICROSD 512GB - DASHCAM.',
    default_price: 1507.80,
    pix_price: 1507.80,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-32.jpg',
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
    id: 'prod-121',
    name: 'CJ TRAVA BAÚ FRIGORÍFICO - P. LATERAL',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ TRAVA BAÚ FRIGORÍFICO - P. LATERAL.',
    default_price: 1564.50,
    pix_price: 1564.50,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-33.jpg',
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
    id: 'prod-122',
    name: 'CJ TRAVA BAÚ FRIGORÍFICO - P. TRASEIRA',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ TRAVA BAÚ FRIGORÍFICO - P. TRASEIRA.',
    default_price: 1757.70,
    pix_price: 1757.70,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-34.jpg',
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
    id: 'prod-123',
    name: 'BOTAO DE PANICO COMPACTO',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — BOTAO DE PANICO COMPACTO.',
    default_price: 59.85,
    pix_price: 59.85,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-35.jpg',
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
    id: 'prod-124',
    name: 'ANTENA GPS EXTERNA (BASE MAGNETICA - CABO 3 METROS)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — ANTENA GPS EXTERNA (BASE MAGNETICA - CABO 3 METROS).',
    default_price: 195.30,
    pix_price: 195.30,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-36.jpg',
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
    id: 'prod-125',
    name: 'KIT INSTALACAO RELE FULL TIME (24V)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — KIT INSTALACAO RELE FULL TIME (24V).',
    default_price: 130.00,
    pix_price: 130.00,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-37.jpg',
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
    id: 'prod-126',
    name: 'KIT Perfil Omêga - VAN',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — KIT Perfil Omêga - VAN.',
    default_price: 95.90,
    pix_price: 95.90,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-38.jpg',
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
    id: 'prod-127',
    name: 'KIT SUPORTE RELE c/RELE',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — KIT SUPORTE RELE c/RELE.',
    default_price: 58.95,
    pix_price: 58.95,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-39.jpg',
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
    id: 'prod-128',
    name: 'CJ TRAVA MOTORIZADA CARRETA P TRAS. 02 FOLHAS (LEGADO)',
    category_id: 'cat-2',
    description: 'Acessório e componente homologado Show Tecnologia / Omnilink — CJ TRAVA MOTORIZADA CARRETA P TRAS. 02 FOLHAS (LEGADO).',
    default_price: 1417.50,
    pix_price: 1417.50,
    monthly_fee: 0.00,
    image_url: '/products/prod-img-40.jpg',
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
      { product_id: 'prod-3', quantity: 1 }
    ]
  },
  {
    id: 'tpl-2',
    user_id: 'user-1',
    name: 'Kit Baú & Carga',
    items: [
      { product_id: 'prod-2', quantity: 1 },
      { product_id: 'prod-4', quantity: 1 }
    ]
  }
];
