export interface Plant {
  id: number;
  name: string;
  latin_name?: string;
  category?: string;
  quantity: number;
  unit: string;
  price?: number;
  supplier?: string;
  location?: string;
  notes?: string;
  pdf_source?: string;
  created_at?: string;
}

export interface PlantFormData {
  name: string;
  latin_name: string;
  category: string;
  quantity: number;
  unit: string;
  price: string;
  supplier: string;
  location: string;
  notes: string;
}

export const API_PLANTS = 'https://functions.poehali.dev/ff57c64d-2ef3-40a0-b0ef-d3ecc109a1fa';
