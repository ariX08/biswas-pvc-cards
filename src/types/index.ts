export interface CardType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  required_documents: string | null;
  instructions: string | null;
  active: boolean;
  category: string | null;
}

export interface CartFile {
  name: string;
  type: string;
  size: number;
  data: ArrayBuffer;
}

export interface CartItem {
  id: string;
  cardTypeId: string;
  cardName: string;
  slug: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  files: CartFile[];
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BusinessSettings {
  business_name: string;
  upi_id: string;
  upi_qr_url: string | null;
  advance_percentage: number;
  delivery_charge: number;
  free_delivery_min_quantity: number;
  phone: string;
  email: string;
  address: string;
}

export type OrderStatus =
  | "PENDING_PAYMENT_VERIFICATION"
  | "CONFIRMED"
  | "PROCESSING"
  | "PRINTING"
  | "READY"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";
