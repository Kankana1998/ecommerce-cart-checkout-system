export type ProductId = string;

export interface CartItem {
  productId: ProductId;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  appliedDiscountCode?: string;
}

export interface DiscountCode {
  code: string;
  discountPercent: number;
  isUsed: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  discountCode?: string;
  discountAmount: number;
  finalAmount: number;
  createdAt: Date;
}

export interface StoreStats {
  totalItemsPurchased: number;
  totalPurchaseAmount: number;
  totalDiscountAmount: number;
  discountCodes: DiscountCode[];
}

