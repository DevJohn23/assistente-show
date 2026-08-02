-- =============================================================================
-- SCHEMA SQL - ASSISTENTE SHOW (Omnilink / Show Tecnologia)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Enums
DO $$ BEGIN
    CREATE TYPE client_type AS ENUM ('PF', 'PJ');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE opportunity_status AS ENUM ('active', 'renewed', 'expired', 'won', 'lost');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE commission_registration_type AS ENUM (
        'own',                    -- Venda Própria (Minha venda, eu implantei)
        'implanted_for_other',     -- Implantei para outro (Comissão cai na minha conta -> A PAGAR/REPASSAR)
        'other_implanted_for_me'   -- Outro implantou para mim (Comissão cai na conta do outro -> A RECEBER)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE commission_status AS ENUM ('pending', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- 1. PROFILES (Perfis dos Vendedores estendendo auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    seller_type client_type DEFAULT 'PJ',
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. CATEGORIES (Categorias dos Produtos da Omnilink)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. PRODUCTS (Catálogo de Produtos com Regras Comerciais)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    default_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    pix_price NUMERIC(10, 2), -- Preço promocional PIX (opcional)
    monthly_fee NUMERIC(10, 2) DEFAULT 0.00, -- Mensalidade (quando existir)
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    commercial_rules JSONB DEFAULT '{
        "allow_pix": true,
        "allow_boleto": true,
        "max_boleto_installments": 3,
        "allow_card": true,
        "max_card_installments": 12,
        "allow_financing": false
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. OPPORTUNITIES (Módulo de Oportunidades & Lembretes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    cpf_cnpj TEXT NOT NULL,
    type client_type NOT NULL DEFAULT 'PF',
    phone TEXT NOT NULL, -- WhatsApp / Telefone (apenas dígitos)
    company_name TEXT,
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE NOT NULL,
    notes TEXT,
    status opportunity_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. COMMISSIONS (Módulo de Comissões & Controle de Repasses)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    sale_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    commission_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sale_time TIME DEFAULT CURRENT_TIME,
    
    installer_option TEXT NOT NULL CHECK (installer_option IN ('me', 'other')),
    other_installer_name TEXT,
    
    registration_type commission_registration_type NOT NULL,
    status commission_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. QUOTE TEMPLATES (Modelos / Kits de Orçamento)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quote_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- ex: "Kit Cavalo Mecânico", "Kit Baú"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quote_template_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES public.quote_templates(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

-- -----------------------------------------------------------------------------
-- 7. QUOTE HISTORY (Histórico de Orçamentos Gerados com Preços Congelados)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_name TEXT,
    subtotal_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    final_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_options_selected JSONB DEFAULT '[]'::jsonb,
    generated_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL, -- Preço unitário congelado
    monthly_fee NUMERIC(10, 2) DEFAULT 0.00, -- Mensalidade congelada
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Products & Categories Policies
DROP POLICY IF EXISTS "Leitura de produtos por todos" ON public.products;
CREATE POLICY "Leitura de produtos por todos" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura de categorias por todos" ON public.categories;
CREATE POLICY "Leitura de categorias por todos" ON public.categories FOR SELECT USING (true);

-- User Isolation Policies
DROP POLICY IF EXISTS "Vendedor acessa proprio perfil" ON public.profiles;
CREATE POLICY "Vendedor acessa proprio perfil" ON public.profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Vendedor acessa proprias oportunidades" ON public.opportunities;
CREATE POLICY "Vendedor acessa proprias oportunidades" ON public.opportunities FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendedor acessa proprias comissoes" ON public.commissions;
CREATE POLICY "Vendedor acessa proprias comissoes" ON public.commissions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendedor acessa proprios modelos de orcamento" ON public.quote_templates;
CREATE POLICY "Vendedor acessa proprios modelos de orcamento" ON public.quote_templates FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendedor acessa itens dos seus modelos" ON public.quote_template_items;
CREATE POLICY "Vendedor acessa itens dos seus modelos" ON public.quote_template_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.quote_templates qt 
        WHERE qt.id = quote_template_items.template_id 
        AND qt.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Vendedor acessa proprios orcamentos" ON public.quotes;
CREATE POLICY "Vendedor acessa proprios orcamentos" ON public.quotes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendedor acessa itens dos seus orcamentos" ON public.quote_items;
CREATE POLICY "Vendedor acessa itens dos seus orcamentos" ON public.quote_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.quotes q 
        WHERE q.id = quote_items.quote_id 
        AND q.user_id = auth.uid()
    )
);
