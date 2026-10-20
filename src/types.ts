export type ProductCategory = 
  | 'hepsi'
  | 'meyve-sebze'
  | 'abur-cubur'
  | 'temizlik'
  | 'sut-kahvaltilik'
  | 'temel-gida';

export interface Product {
  id: string;
  name: string;
  category: 'meyve-sebze' | 'abur-cubur' | 'temizlik' | 'sut-kahvaltilik' | 'temel-gida';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  description: string;
  tags: string[];
  badges?: string[]; // e.g., ['Organik', 'İndirimli', 'Yerli Üretim']
  keywords: string[]; // For semantic token matching
  nutrition?: {
    calories?: string;
    origin?: string;
    features?: string[];
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SearchCorrection {
  originalQuery: string;
  correctedWord: string;
  confidence: number; // 0 to 1
  isCorrected: boolean;
  similarTerms: { word: string; score: number }[];
  matchedProductsCount?: number;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  correctedTo?: string;
  categoryAffinity?: ProductCategory;
}

export interface UserPreferences {
  searchHistory: SearchHistoryItem[];
  categoryScores: Record<ProductCategory, number>;
  favoriteProductIds: string[];
}

export interface FilterOptions {
  category: ProductCategory;
  minPrice: number;
  maxPrice: number;
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'discount';
  onlyDiscounted: boolean;
  onlyOrganic: boolean;
  inStockOnly: boolean;
}
