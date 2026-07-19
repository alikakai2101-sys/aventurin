export interface Product {
  id: string;
  title: string;
  description: string;
  price: number; // in Tomans
  image: string;
  category: 'necklace' | 'ring' | 'earrings' | 'bracelet';
  stock: number;
  variants: string[]; // e.g., ['طلایی', 'نقره‌ای', 'رزگلد']
  rating: number;
  isFeatured?: boolean;
  discount?: number; // percentage (e.g., 10 for 10% off)
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  postalCode: string;
  city: string;
  province: string;
  items: {
    productId: string;
    productTitle: string;
    quantity: number;
    price: number;
    variant: string;
  }[];
  totalPrice: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  trackingCode: string;
  date: string;
}

export type StoreCategory = {
  id: 'necklace' | 'ring' | 'earrings' | 'bracelet';
  name: string;
  icon: string;
};

export interface SampleCategory {
  id: string;
  name: string;
}

export interface SampleItem {
  id: string;
  title: string;
  description: string;
  category: string; // e.g. "necklace", "ring", "earrings", "bracelet"
  basePrice?: number; // Optional recommended/starting price
  image: string;
  material: 'gold' | 'silver' | 'steel' | 'rose-gold' | string; // e.g. طلا، نقره، استیل
  stone: 'diamond' | 'emerald' | 'pearl' | 'none' | string; // سنگ گرانبها
  color: 'gold' | 'silver' | 'rose-gold' | string; // رنگ بدنه
  createdAt: string;
}

export interface CustomOrder {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  selectedSamples: string[]; // List of SampleItem IDs chosen as reference
  uploadedImages: string[]; // URLs or Base64 images uploaded by user
  description: string;
  status: 'pending' | 'chatting' | 'priced' | 'accepted' | 'paid' | 'canceled';
  adminPrice?: number; // Price estimated by admin
  finalPrice?: number; // Paid amount
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  sender: 'user' | 'admin';
  senderName: string;
  message: string;
  imageUrl?: string;
  createdAt: string;
  expiresAt: string; // 12 hours from creation if not paid
}

