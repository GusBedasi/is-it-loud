import { dataService } from './data-service';
import { imageCDN } from './image-cdn';

// Re-export types for backward compatibility
export type { Item, SoundInfo } from './types';

// API functions that use the data service
export const getItems = async () => {
  const items = await dataService.getItems();
  return items.map(item => ({
    ...item,
    image: imageCDN.getOptimizedUrl(item.image, 'card')
  }));
};

export const getItemById = async (id: number) => {
  const item = await dataService.getItemById(id);
  if (!item) return null;
  
  return {
    ...item,
    image: imageCDN.getOptimizedUrl(item.image, 'full')
  };
};

export const getItemsByCategory = async (category: string) => {
  const items = await dataService.getItemsByCategory(category);
  return items.map(item => ({
    ...item,
    image: imageCDN.getOptimizedUrl(item.image, 'card')
  }));
};

export const searchItems = async (query: string) => {
  const items = await dataService.searchItems(query);
  return items.map(item => ({
    ...item,
    image: imageCDN.getOptimizedUrl(item.image, 'card')
  }));
};

export const getCategories = async () => {
  return dataService.getCategories();
};

export const validateItem = (item: any): item is import('./types').Item => {
  return (
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    typeof item.soundLevel === 'number' &&
    typeof item.image === 'string' &&
    typeof item.category === 'string' &&
    typeof item.description === 'string' &&
    item.soundLevel >= 0 &&
    item.soundLevel <= 120
  );
};