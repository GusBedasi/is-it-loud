export interface Item {
  id: number;
  name: string;
  soundLevel: number;
  image: string;
  category: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SoundInfo {
  icon: JSX.Element;
  text: string;
  variant: 'default' | 'destructive' | 'warning' | 'success';
  description: string;
}

export interface DataSource {
  getItems(): Promise<Item[]>;
  getItemById(id: number): Promise<Item | null>;
  getItemsByCategory(category: string): Promise<Item[]>;
  searchItems(query: string): Promise<Item[]>;
  getCategories(): Promise<string[]>;
}

export interface ImageCDNConfig {
  baseUrl: string;
  transformations?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
    fit?: 'cover' | 'contain' | 'fill';
  };
}