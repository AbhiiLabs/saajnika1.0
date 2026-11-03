export interface Category {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  product_count?: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color_name: string;
  color_hex: string;
  additional_price: string;
  stock_quantity: number;
  is_active: boolean;
  final_price: string;
  is_in_stock: boolean;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_name?: string;
  category_slug?: string;
  category?: Category;
  collection_name?: string;
  base_price: string;
  sale_price?: string | null;
  current_price: string;
  discount_percent: number;
  short_description: string;
  description?: string;
  fabric_and_care?: string;
  fit_and_sizing?: string;
  shipping_and_returns?: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  primary_image: string;
  secondary_image?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  available_colors?: { color_name: string; color_hex: string }[];
  available_sizes?: string[];
  total_stock: number;
}

export interface CartItem {
  id: string;
  variant: string;
  product_name: string;
  product_slug: string;
  primary_image: string;
  size: string;
  color_name: string;
  color_hex: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  stock_quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: string;
  total_items: number;
  updated_at: string;
}

export interface Address {
  id?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  address_type?: string;
  is_default?: boolean;
}

export interface OrderItem {
  id: string;
  product_name: string;
  sku: string;
  size: string;
  color: string;
  unit_price: string;
  quantity: number;
  total_price: string;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: string;
  discount_amount: string;
  shipping_fee: string;
  tax_amount: string;
  total_amount: string;
  coupon_code?: string;
  shipping_address: Address;
  customer_notes?: string;
  cancel_reason?: string;
  return_reason?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  customer_name?: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF';
  is_verified: boolean;
  profile?: {
    avatar?: string;
    loyalty_tier?: string;
  };
}

export interface HomepageBanner {
  id: string;
  banner_type: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  secondary_image_url?: string;
  display_order: number;
}
