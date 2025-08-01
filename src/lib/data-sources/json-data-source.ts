import itemsData from '@/data/items.json';
import { Item, DataSource } from '@/lib/types';
import { approvedItemsService } from '@/lib/approved-items';

export class JsonDataSource implements DataSource {
  async getItems(): Promise<Item[]> {
    // Combine original items with approved items
    const originalItems = itemsData as Item[];
    const approvedItems = approvedItemsService.getApprovedItems();
    return Promise.resolve([...originalItems, ...approvedItems]);
  }

  async getItemById(id: number): Promise<Item | null> {
    // Check original items first
    const originalItem = itemsData.find(item => item.id === id);
    if (originalItem) {
      return Promise.resolve(originalItem as Item);
    }
    
    // Check approved items
    const approvedItem = approvedItemsService.getApprovedItemById(id);
    return Promise.resolve(approvedItem);
  }

  async getItemsByCategory(category: string): Promise<Item[]> {
    // Combine original and approved items for category filtering
    const originalItems = itemsData.filter(item => item.category === category) as Item[];
    const approvedItems = approvedItemsService.getApprovedItemsByCategory(category);
    return Promise.resolve([...originalItems, ...approvedItems]);
  }

  async searchItems(query: string): Promise<Item[]> {
    const lowercaseQuery = query.toLowerCase();
    
    // Search original items
    const originalItems = itemsData.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery)
    ) as Item[];
    
    // Search approved items
    const approvedItems = approvedItemsService.searchApprovedItems(query);
    
    return Promise.resolve([...originalItems, ...approvedItems]);
  }

  async getCategories(): Promise<string[]> {
    // Combine categories from original and approved items
    const originalCategories = itemsData.map(item => item.category);
    const approvedCategories = approvedItemsService.getApprovedCategories();
    const allCategories = [...originalCategories, ...approvedCategories];
    const uniqueCategories = [...new Set(allCategories)];
    return Promise.resolve(uniqueCategories);
  }
}