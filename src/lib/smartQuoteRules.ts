import { Product } from '@/types';

export type VehicleCategory = 'truck_mono' | 'tractor' | 'van_utilitarian';

export type ImplementType =
  | 'box_dry'           // Baú Seco
  | 'box_refrigerated'  // Baú Refrigerado / Frigorífico
  | 'sider'             // Sider (Lonado)
  | 'tank'              // Tanque (Combustível, Químico, etc.)
  | 'bulk'              // Graneleiro / Caçamba Basculante
  | 'flatbed'           // Prancha / Plataforma
  | 'container'         // Container
  | 'van_box'           // Van tipo Baú (Sprinter, Master, Ducato)
  | 'van_fiorino'       // Fiorino / Kangoo / Pequeno Utilitário
  | 'van_hr_bongo'      // HR / Bongo com Baú
  | 'none';             // Nenhum / Não se aplica

export interface SmartQuoteConfig {
  category: VehicleCategory;
  implementType: ImplementType;
  rearDoorType: 'double_leaf' | 'roll_up' | 'none';
  hasSideDoor: boolean;
  isRefrigerated: boolean;
  tractorHasTrailer: boolean;
  tractorTrailerIsBox: boolean;
  includeFifthWheel: boolean;
}

/**
 * Retorna os valores padrão dos toggles com base no tipo de implemento selecionado.
 * O vendedor pode sobrescrever qualquer valor depois.
 */
export function getDefaultsForImplement(
  implementType: ImplementType
): Partial<SmartQuoteConfig> {
  switch (implementType) {
    case 'box_dry':
      return {
        rearDoorType: 'double_leaf',
        hasSideDoor: false,
        isRefrigerated: false,
        tractorTrailerIsBox: true,
      };
    case 'box_refrigerated':
      return {
        rearDoorType: 'double_leaf',
        hasSideDoor: false,
        isRefrigerated: true,
        tractorTrailerIsBox: true,
      };
    case 'sider':
      return {
        rearDoorType: 'none',
        hasSideDoor: false,
        isRefrigerated: false,
        tractorTrailerIsBox: false,
      };
    case 'tank':
    case 'bulk':
    case 'flatbed':
      return {
        rearDoorType: 'none',
        hasSideDoor: false,
        isRefrigerated: false,
        tractorTrailerIsBox: false,
      };
    case 'container':
      return {
        rearDoorType: 'double_leaf',
        hasSideDoor: false,
        isRefrigerated: false,
        tractorTrailerIsBox: true,
      };
    case 'van_box':
      return {
        hasSideDoor: true,
        isRefrigerated: false,
      };
    case 'van_fiorino':
      return {
        hasSideDoor: false,
        isRefrigerated: false,
      };
    case 'van_hr_bongo':
      return {
        rearDoorType: 'double_leaf',
        hasSideDoor: false,
        isRefrigerated: false,
      };
    default:
      return {};
  }
}

export interface RecommendationItem {
  product: Product;
  reason: string;
  isSelected: boolean;
  quantity: number;
}

/**
 * Normaliza strings para busca sem acento / maiúsculas
 */
function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

/**
 * Encontra um produto no catálogo por termos de pesquisa no nome
 */
function findProduct(products: Product[], ...keywords: string[]): Product | undefined {
  return products.find((p) => {
    const nameNorm = normalize(p.name);
    return keywords.every((kw) => nameNorm.includes(normalize(kw)));
  });
}

/**
 * Gera a lista de produtos recomendados com base nas especificações do veículo.
 * Todos os itens iniciam desmarcados (isSelected = false) para que o usuário escolha diretamente.
 */
export function getRecommendedProducts(
  config: SmartQuoteConfig,
  allProducts: Product[]
): RecommendationItem[] {
  const items: RecommendationItem[] = [];

  const addRecommendation = (prod: Product | undefined, reason: string, isSelected = false, quantity = 1) => {
    if (!prod) return;
    // Evita duplicados na recomendação
    if (items.some((i) => i.product.id === prod.id)) return;
    items.push({
      product: prod,
      reason,
      isSelected,
      quantity
    });
  };

  // ---------------------------------------------------------------------------
  // 1. KITS DE CABINE (Opções para o vendedor escolher diretamente nos cards)
  // ---------------------------------------------------------------------------
  const omniturbo = findProduct(allProducts, 'OMNITURBO');
  addRecommendation(omniturbo, 'Kit Cabine Principal — Telemetria e rastreamento em tempo real.');

  const omnidual = findProduct(allProducts, 'OMNIDUAL');
  addRecommendation(omnidual, 'Kit Cabine Principal — Dupla comunicação celular / Dual Chip para redundância.');

  // ---------------------------------------------------------------------------
  // 2. CAVALO MECÂNICO (Articulado / Engate & Desengate)
  // ---------------------------------------------------------------------------
  if (config.category === 'tractor') {
    if (config.tractorHasTrailer) {
      const sensorEngate = findProduct(allProducts, 'SENSOR DE ENGATE E DESENGATE ELETRÔNICO');
      addRecommendation(sensorEngate, 'Detecta o engate e desengate de carretas/semirreboques via telemetria.');

      const chicoteEspiral = findProduct(allProducts, 'CONEXÃO CAVALO', 'ESPIRAL');
      addRecommendation(chicoteEspiral, 'Cabo espiral reforçado Plug & Play para comunicação entre cavalo e carreta.');

      const tomadaConexao = findProduct(allProducts, 'TOMADA');
      addRecommendation(tomadaConexao, 'Tomada elétrica industrial para acoplamento do chicote entre cavalo e carreta.');

      // Se a carreta rebocada for do tipo Baú, adiciona as recomendações de trava para a carreta
      if (config.tractorTrailerIsBox) {
        if (config.isRefrigerated) {
          // Ambos os modelos de trava frigorífica traseira mantidos na lista para escolha do usuário
          const travaBauFrigorificoTraseira = findProduct(allProducts, 'CJ TRAVA BAÚ FRIGORÍFICO - P. TRASEIRA');
          addRecommendation(travaBauFrigorificoTraseira, 'Trava blindada para porta traseira de baú frigorífico.');

          const travaCarretaFrigorificaTraseira = findProduct(allProducts, 'CJ TRAVA CARRETA FRIGORÍFICA - P. TRASEIRA');
          addRecommendation(travaCarretaFrigorificaTraseira, 'Trava reforçada para porta traseira de carreta frigorífica.');

          if (config.hasSideDoor) {
            const travaFrigorificaLateral = findProduct(allProducts, 'CJ TRAVA BAÚ FRIGORÍFICO - P. LATERAL');
            addRecommendation(travaFrigorificaLateral, 'Trava frigorífica para porta lateral de baú.');
          }

          const sensorTemp = findProduct(allProducts, 'CJ - SENSOR DE TEMPERATURA INOX') || findProduct(allProducts, 'SENSOR DE TEMPERATURA');
          addRecommendation(sensorTemp, 'Sensor de temperatura em inox para controle térmico da carreta frigorífica.');
        } else {
          if (config.rearDoorType === 'double_leaf') {
            const travaBauFolhaDupla = findProduct(allProducts, 'CJ TRAVA BAÚ - P. TRASEIRA DUPLA');
            addRecommendation(travaBauFolhaDupla, 'Trava motorizada reforçada para porta traseira de 2 folhas (Baú).');

            const travaCarretaFolhaDupla = findProduct(allProducts, 'CJ TRAVA CARRETA - P. TRASEIRA DUPLA');
            addRecommendation(travaCarretaFolhaDupla, 'Trava motorizada reforçada para porta traseira de 2 folhas (Carreta).');
          } else if (config.rearDoorType === 'roll_up') {
            const travaRollUp = findProduct(allProducts, 'CJ TRAVA BAÚ - P. TRASEIRA ROLL UP') || findProduct(allProducts, 'CJ TRAVA CARRETA - P. TRASEIRA ROLL UP');
            addRecommendation(travaRollUp, 'Trava motorizada para porta traseira de enrolar (Roll-Up).');
          }

          if (config.hasSideDoor) {
            const travaLateral = findProduct(allProducts, 'CJ TRAVA BAÚ - P. LATERAL');
            addRecommendation(travaLateral, 'Trava motorizada para porta lateral de baú.');
          }
        }
      }
    }

    if (config.includeFifthWheel) {
      const travaFontaine = findProduct(allProducts, 'TRAVA DE QUINTA RODA DIGITAL FONTAINE + ARIETE');
      addRecommendation(travaFontaine, 'Sistema digital de segurança eletrônica de travamento do pino rei (Fontaine + Aríete).');

      const travaELock = findProduct(allProducts, 'TRAVA DE QUINTA RODA E.LOCK');
      addRecommendation(travaELock, 'Trava eletromecânica de alta resistência para quinta roda (E.Lock).');

      const arieteFontaine = findProduct(allProducts, 'ARIETE DA QUINTA RODA FONTAINE');
      addRecommendation(arieteFontaine, 'Suporte/Aríete homologado de acoplamento da trava de quinta roda.');
    }
  }

  // ---------------------------------------------------------------------------
  // 3. CAMINHÃO RÍGIDO / MONOBLOCO COM BAÚ
  // ---------------------------------------------------------------------------
  if (config.category === 'truck_mono') {
    // Conexões e fiação da cabine ao baú monobloco (necessárias para acionamento de travas e sensores)
    const tomadaConexao = findProduct(allProducts, 'TOMADA');
    addRecommendation(tomadaConexao, 'Tomada de conexão para interligação elétrica entre cabine e baú monobloco.');

    const chicoteConexao = findProduct(allProducts, 'CONEXÃO CAVALO', 'ESPIRAL') || findProduct(allProducts, 'CHICOTE');
    addRecommendation(chicoteConexao, 'Chicote de conexão reforçado para sinal e alimentação dos atuadores do baú.');

    if (config.isRefrigerated) {
      // Recomenda ambos os modelos de trava frigorífica traseira para o usuário escolher diretamente nos cards
      const travaBauFrigorificoTraseira = findProduct(allProducts, 'CJ TRAVA BAÚ FRIGORÍFICO - P. TRASEIRA');
      addRecommendation(travaBauFrigorificoTraseira, 'Trava blindada para porta traseira de baú frigorífico.');

      const travaCarretaFrigorificaTraseira = findProduct(allProducts, 'CJ TRAVA CARRETA FRIGORÍFICA - P. TRASEIRA');
      addRecommendation(travaCarretaFrigorificaTraseira, 'Trava reforçada para porta traseira de carreta frigorífica.');

      if (config.hasSideDoor) {
        const travaFrigorificaLateral = findProduct(allProducts, 'CJ TRAVA BAÚ FRIGORÍFICO - P. LATERAL');
        addRecommendation(travaFrigorificaLateral, 'Trava frigorífica para porta lateral de baú.');
      }

      const sensorTemp = findProduct(allProducts, 'CJ - SENSOR DE TEMPERATURA INOX') || findProduct(allProducts, 'SENSOR DE TEMPERATURA');
      addRecommendation(sensorTemp, 'Sensor de temperatura em inox para controle térmico de cargas perecíveis.');
    } else {
      // Para Baú Tradicional (não refrigerado)
      if (config.rearDoorType === 'double_leaf') {
        const travaBauFolhaDupla = findProduct(allProducts, 'CJ TRAVA BAÚ - P. TRASEIRA DUPLA');
        addRecommendation(travaBauFolhaDupla, 'Trava motorizada reforçada específica para porta traseira de 2 folhas (Baú).');

        const travaCarretaFolhaDupla = findProduct(allProducts, 'CJ TRAVA CARRETA - P. TRASEIRA DUPLA');
        addRecommendation(travaCarretaFolhaDupla, 'Trava motorizada reforçada específica para porta traseira de 2 folhas (Carreta).');
      } else if (config.rearDoorType === 'roll_up') {
        const travaRollUp = findProduct(allProducts, 'CJ TRAVA BAÚ - P. TRASEIRA ROLL UP') || findProduct(allProducts, 'CJ TRAVA CARRETA - P. TRASEIRA ROLL UP');
        addRecommendation(travaRollUp, 'Trava motorizada interna própria para portas traseiras de enrolar (Roll-Up).');
      }

      if (config.hasSideDoor) {
        const travaLateral = findProduct(allProducts, 'CJ TRAVA BAÚ - P. LATERAL');
        addRecommendation(travaLateral, 'Trava motorizada reforçada para acionamento e segurança da porta lateral.');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 4. VAN, FIORINO & UTILITÁRIOS LEVES
  // ---------------------------------------------------------------------------
  if (config.category === 'van_utilitarian') {
    const travaVanTraseira = findProduct(allProducts, 'CJ TRAVA ELETROMAG. VAN - P. TRASEIRA') || findProduct(allProducts, 'ELETROMAG. VAN', 'TRASEIRA');
    addRecommendation(travaVanTraseira, 'Trava eletromagnética compacta projetada para porta traseira de vans e utilitários.');

    if (config.hasSideDoor) {
      const travaVanLateral = findProduct(allProducts, 'CJ TRAVA ELETROMAG. VAN - P. LATERAL') || findProduct(allProducts, 'ELETROMAG. VAN', 'LATERAL');
      addRecommendation(travaVanLateral, 'Trava eletromagnética própria para porta de correr lateral de vans.');
    }

    const batente = findProduct(allProducts, 'BATENTE PL CORRER SPRINTER') || findProduct(allProducts, 'BATENTE CANTONEIRA') || findProduct(allProducts, 'BATENTE');
    addRecommendation(batente, 'Batente de proteção e alinhamento mecânico do mecanismo de trava.');
  }

  return items;
}
