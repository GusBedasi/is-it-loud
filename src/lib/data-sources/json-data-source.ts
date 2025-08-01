import itemsData from '@/data/items.json';
import { Item, DataSource } from '@/lib/types';

export class JsonDataSource implements DataSource {
  async getItems(): Promise<Item[]> {
    // Simulate async behavior for consistency with database
    return Promise.resolve(itemsData as Item[]);
  }

  async getItemById(id: number): Promise<Item | null> {
    const item = itemsData.find(item => item.id === id);
    return Promise.resolve(item ? (item as Item) : null);
  }

  async getItemsByCategory(category: string): Promise<Item[]> {
    const items = itemsData.filter(item => item.category === category);
    return Promise.resolve(items as Item[]);
  }

  async searchItems(query: string): Promise<Item[]> {
    const lowercaseQuery = query.toLowerCase();
    const items = itemsData.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery)
    );
    return Promise.resolve(items as Item[]);
  }

  async getCategories(): Promise<string[]> {
    const categories = itemsData.map(item => item.category);
    const uniqueCategories = [...new Set(categories)];
    return Promise.resolve(uniqueCategories);
  }
}