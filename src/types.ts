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
