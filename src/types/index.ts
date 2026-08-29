export type ClientType = 'PF' | 'PJ';

export type OpportunityStatus = 'active' | 'renewed' | 'expired' | 'won' | 'lost';

export type CommissionRegistrationType = 
  | 'own'                   // Venda Própria (Minha venda, eu implantei)
  | 'implanted_for_other'    // Implantei para outro (Comissão entra para mim -> A PAGAR)
  | 'other_implanted_for_me';// Outro implantou para mim (Comissão entra para outro -> A RECEBER)

export type CommissionStatus = 'pending' | 'paid';

export interface CommercialRules {
  allow_pix: boolean;
  allow_boleto: boolean;
  max_boleto_installments: number;
  allow_card: boolean;
  max_card_installments: number;
  allow_financing: boolean;
}

export interface Tecnico {
  id: number;
  nome: string;
  categoria: string;
  tipo: string;
  descricao: string;
  telefone: string;
  email: string;
  lat: number;
  lng: number;
  vendedor_parceiro: string;
}

export interface Product {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  default_price: number;
  pix_price?: number;
  monthly_fee?: number;
  image_url?: string;
  is_active: boolean;
  commercial_rules: CommercialRules;
}

export interface Opportunity {
  id: string;
  user_id: string;
  client_name: string;
  cpf_cnpj: string;
  type: ClientType;
  phone: string;
  company_name?: string;
  registration_date: string;
  expiration_date: string;
  notes?: string;
  status: OpportunityStatus;
}

export interface Commission {
  id: string;
  user_id: string;
  client_name: string;
  sale_amount: number;
  commission_amount: number;
  sale_date: string;
  sale_time?: string;
  installer_option: 'me' | 'other';
  other_installer_name?: string;
  registration_type: CommissionRegistrationType;
  status: CommissionStatus;
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface QuoteTemplate {
  id: string;
  user_id: string;
  name: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
}
