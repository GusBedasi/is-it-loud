import { DataSource } from './types';
import { JsonDataSource } from './data-sources/json-data-source';
import { DatabaseDataSource } from './data-sources/database-data-source';

class DataService {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = this.createDataSource();
  }

  private createDataSource(): DataSource {
    const environment = process.env.NODE_ENV;
    const useDatabase = process.env.USE_DATABASE === 'true';
    
    if (environment === 'production' || useDatabase) {
      // In production or when explicitly configured, use database
      try {
        // This would be your actual database client initialization
        // Example with Prisma: const prisma = new PrismaClient();
        // For now, we'll fallback to JSON if no database is configured
        if (process.env.DATABASE_URL) {
          // const databaseClient = initializeDatabaseClient();
          // return new DatabaseDataSource(databaseClient);
          console.warn('Database URL provided but database client not initialized. Falling back to JSON data source.');
        }
        return new JsonDataSource();
      } catch (error) {
        console.error('Failed to initialize database connection, falling back to JSON:', error);
        return new JsonDataSource();
      }
    }
    
    // In development, use JSON data source
    return new JsonDataSource();
  }

  async getItems() {
    return this.dataSource.getItems();
  }

  async getItemById(id: number) {
    return this.dataSource.getItemById(id);
  }

  async getItemsByCategory(category: string) {
    return this.dataSource.getItemsByCategory(category);
  }

  async searchItems(query: string) {
    return this.dataSource.searchItems(query);
  }

  async getCategories() {
    return this.dataSource.getCategories();
  }

  // Method to switch data source at runtime (useful for testing)
  setDataSource(dataSource: DataSource) {
    this.dataSource = dataSource;
  }
}

// Export singleton instance
export const dataService = new DataService();

// Export class for custom instances
export { DataService };