export type ApplicationType = "exhibitor" | "media" | "partner";
export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  instagram_handle: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  data: ExhibitorData | MediaData | PartnerData;
  wants_cabin: boolean;
  cabin_payment_confirmed: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

export interface CabinSettings {
  cabin_price_pln: number;
  cabin_payment_deadline_message: string;
}

export interface ExhibitorData {
  car_name: string;
  modification_description: string;
  instagram_handle: string;
  photo_paths: string[];
}

export interface MediaData {
  instagram_handle: string;
  portfolio_url?: string;
  experience_description: string;
}

export interface PartnerData {
  contact_number: string;
  company_name: string;
  application_description: string;
}

export interface ApplicationMessage {
  id: string;
  application_id: string;
  sender_id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
}

export interface ApplicationPhoto {
  id: string;
  application_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  sort_order: number;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  storage_path: string;
  thumbnail_path: string | null;
  media_type: "image" | "video";
  title: string | null;
  description: string | null;
  event_name: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price_pln: number | null;
  show_price: boolean;
  instagram_contact_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  is_primary: boolean;
  sort_order: number;
}
