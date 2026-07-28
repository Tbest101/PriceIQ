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

export interface OptimizedItem {
  name: string;
  quantity: number;
  store: string;
  unitPrice: number;
  lineTotal: number;
  title: string;
  unitPriceNormalized?: number;
  unitType?: string;
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
}
