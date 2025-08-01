import { Item, DataSource } from '@/lib/types';

// This would be your actual database client (Prisma, MongoDB, etc.)
interface DatabaseClient {
  items: {
    findMany: (options?: any) => Promise<any[]>;
    findUnique: (options: { where: { id: number } }) => Promise<any | null>;
    findFirst: (options: any) => Promise<any | null>;
  };
}

export class DatabaseDataSource implements DataSource {
  private db: DatabaseClient;

  constructor(databaseClient: DatabaseClient) {
    this.db = databaseClient;
  }

  async getItems(): Promise<Item[]> {
    try {
      const items = await this.db.items.findMany({
        orderBy: { id: 'asc' }
      });
      return items.map(this.transformDatabaseItem);
    } catch (error) {
      console.error('Error fetching items from database:', error);
      throw new Error('Failed to fetch items');
    }
  }

  async getItemById(id: number): Promise<Item | null> {
    try {
      const item = await this.db.items.findUnique({
        where: { id }
      });
      return item ? this.transformDatabaseItem(item) : null;
    } catch (error) {
      console.error('Error fetching item by ID:', error);
      throw new Error(`Failed to fetch item with ID ${id}`);
    }
  }

  async getItemsByCategory(category: string): Promise<Item[]> {
    try {
      const items = await this.db.items.findMany({
        where: { category },
        orderBy: { id: 'asc' }
      });
      return items.map(this.transformDatabaseItem);
    } catch (error) {
      console.error('Error fetching items by category:', error);
      throw new Error(`Failed to fetch items for category ${category}`);
    }
  }

  async searchItems(query: string): Promise<Item[]> {
    try {
      const items = await this.db.items.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        orderBy: { id: 'asc' }
      });
      return items.map(this.transformDatabaseItem);
    } catch (error) {
      console.error('Error searching items:', error);
      throw new Error(`Failed to search items with query: ${query}`);
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const result = await this.db.items.findMany({
        select: { category: true },
        distinct: ['category']
      });
      return result.map(item => item.category);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  private transformDatabaseItem(dbItem: any): Item {
    return {
      id: dbItem.id,
      name: dbItem.name,
      soundLevel: dbItem.soundLevel,
      image: dbItem.image,
      category: dbItem.category,
      description: dbItem.description,
      createdAt: dbItem.createdAt,
      updatedAt: dbItem.updatedAt
    };
  }
}