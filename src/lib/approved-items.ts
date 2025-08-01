import { Item } from './types';

// localStorage-based storage for approved items in development
const APPROVED_ITEMS_KEY = 'isitloud_approved_items';
const NEXT_ITEM_ID_KEY = 'isitloud_next_item_id';

// Helper functions for localStorage
const loadApprovedItemsFromStorage = (): Item[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(APPROVED_ITEMS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveApprovedItemsToStorage = (items: Item[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(APPROVED_ITEMS_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save approved items to localStorage:', error);
  }
};

const getNextItemId = (): number => {
  if (typeof window === 'undefined') return 1000; // Start from 1000 to avoid conflicts with existing items
  try {
    const stored = localStorage.getItem(NEXT_ITEM_ID_KEY);
    return stored ? parseInt(stored, 10) : 1000;
  } catch {
    return 1000;
  }
};

const saveNextItemId = (id: number): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NEXT_ITEM_ID_KEY, id.toString());
  } catch (error) {
    console.error('Failed to save next item ID to localStorage:', error);
  }
};

// Service to manage approved items
export class ApprovedItemsService {
  addApprovedItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Item {
    const approvedItems = loadApprovedItemsFromStorage();
    const nextId = getNextItemId();
    
    const newItem: Item = {
      ...item,
      id: nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    approvedItems.push(newItem);
    saveApprovedItemsToStorage(approvedItems);
    saveNextItemId(nextId + 1);
    
    console.log('Approved item added to main database:', newItem);
    return newItem;
  }

  getApprovedItems(): Item[] {
    return loadApprovedItemsFromStorage();
  }

  getApprovedItemById(id: number): Item | null {
    const approvedItems = loadApprovedItemsFromStorage();
    return approvedItems.find(item => item.id === id) || null;
  }

  searchApprovedItems(query: string): Item[] {
    const approvedItems = loadApprovedItemsFromStorage();
    const lowercaseQuery = query.toLowerCase();
    
    return approvedItems.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  getApprovedItemsByCategory(category: string): Item[] {
    const approvedItems = loadApprovedItemsFromStorage();
    return approvedItems.filter(item => item.category === category);
  }

  getApprovedCategories(): string[] {
    const approvedItems = loadApprovedItemsFromStorage();
    const categories = approvedItems.map(item => item.category);
    return [...new Set(categories)];
  }

  // Helper method to delete a specific approved item
  deleteApprovedItem(id: number): boolean {
    const approvedItems = loadApprovedItemsFromStorage();
    const initialLength = approvedItems.length;
    const filteredItems = approvedItems.filter(item => item.id !== id);
    
    if (filteredItems.length === initialLength) {
      return false; // Item not found
    }
    
    saveApprovedItemsToStorage(filteredItems);
    console.log('Approved item deleted:', id);
    return true;
  }

  // Helper method to search approved items
  searchApprovedItemsDetailed(query: string): Item[] {
    const approvedItems = loadApprovedItemsFromStorage();
    if (!query.trim()) {
      return [...approvedItems];
    }
    
    const lowercaseQuery = query.toLowerCase();
    return approvedItems.filter(item =>
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Helper method to clear all approved items (for testing)
  clearAllApprovedItems(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(APPROVED_ITEMS_KEY);
    localStorage.removeItem(NEXT_ITEM_ID_KEY);
  }
}

// Singleton instance
export const approvedItemsService = new ApprovedItemsService();