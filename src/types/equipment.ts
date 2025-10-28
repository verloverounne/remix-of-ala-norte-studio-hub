export type EquipmentStatus = "available" | "rented" | "maintenance";

export type EquipmentCategory =
  | "cameras"
  | "lenses"
  | "lighting"
  | "audio"
  | "accessories"
  | "grip";

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  model: string;
  description: string;
  specs: string[];
  pricePerDay: number;
  pricePerWeek: number;
  status: EquipmentStatus;
  imageUrl: string;
}

export interface QuoteItem {
  equipment: Equipment;
  quantity: number;
  days: number;
}

export interface Quote {
  items: QuoteItem[];
  startDate: Date;
  endDate: Date;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  comments: string;
}
