export interface Product {
  id: string;
  name: string;
  category: string;
  image?: string;
  defaultPrice: number;
  barcode: string;
}

export interface BasketItem {
  product: Product;
  quantity: number;
  size?: string;
}

export interface Retailer {
  id: string;
  name: string;
  logo: string;
  color: string;
}

export interface RetailerPrice {
  retailerId: string;
  productId: string;
  price: number;
  inStock: boolean;
}

export interface ForecastRecommendation {
  action: 'BUY_NOW' | 'WAIT' | 'FAIR_PRICE';
  recommendationText: string;
  expectedRange?: string;
  potentialSavings?: number;
}

export interface OptimizedItem {
  name: string;
  quantity: number;
  store: string;
  unitPrice: number;
  lineTotal: number;
  title: string;
  unitPriceNormalized?: number;
  unitType?: string;
  priceFreshness?: string;
  inStock?: boolean;
  isBestValue?: boolean;
  forecast?: ForecastRecommendation;
}

export type ShoppingMode = 'single' | 'balanced' | 'max_savings';

export interface ShoppingModePlan {
  mode: ShoppingMode;
  title: string;
  stores: string[];
  total: number;
  savingsAmount: number;
  stops: number;
  extraMiles: number;
  extraMinutes: number;
  items: OptimizedItem[];
}

export interface OptimalSplitResult {
  stores: string[];
  total: number;
  items: OptimizedItem[];
  savingsAmount: number;
  savingsPercent: number;
  netSavings?: number;
  travelFrictionDeduction?: number;
  isWorthwhile?: boolean;
  resultType?: string;
  modes?: {
    single: ShoppingModePlan;
    balanced: ShoppingModePlan;
    maxSavings: ShoppingModePlan;
  };
}
