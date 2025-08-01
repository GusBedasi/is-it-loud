import { PendingSubmission, PendingSubmissionDataSource, SubmissionStats, Item } from './types';
import { approvedItemsService } from './approved-items';

// Browser localStorage-based storage for development - in production this would be a database
const STORAGE_KEY = 'isitloud_pending_submissions';
const NEXT_ID_KEY = 'isitloud_next_submission_id';

// Helper functions for localStorage
const loadFromStorage = (): PendingSubmission[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (submissions: PendingSubmission[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch (error) {
    console.error('Failed to save submissions to localStorage:', error);
  }
};

const getNextId = (): number => {
  if (typeof window === 'undefined') return 1;
  try {
    const stored = localStorage.getItem(NEXT_ID_KEY);
    return stored ? parseInt(stored, 10) : 1;
  } catch {
    return 1;
  }
};

const saveNextId = (id: number): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NEXT_ID_KEY, id.toString());
  } catch (error) {
    console.error('Failed to save next ID to localStorage:', error);
  }
};

// Initialize from storage
let pendingSubmissions: PendingSubmission[] = loadFromStorage();
let nextId = getNextId();

export class JsonPendingSubmissionDataSource implements PendingSubmissionDataSource {
  async submitItem(submission: Omit<PendingSubmission, 'id' | 'status' | 'submittedAt'>): Promise<string> {
    const id = `sub_${nextId++}_${Date.now()}`;
    const newSubmission: PendingSubmission = {
      ...submission,
      id,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    
    pendingSubmissions.push(newSubmission);
    saveToStorage(pendingSubmissions);
    saveNextId(nextId);
    
    console.log('New submission received:', newSubmission);
    
    return id;
  }

  async getPendingSubmissions(): Promise<PendingSubmission[]> {
    pendingSubmissions = loadFromStorage(); // Refresh from storage
    return pendingSubmissions.filter(sub => sub.status === 'pending');
  }

  async getSubmissionById(id: string): Promise<PendingSubmission | null> {
    pendingSubmissions = loadFromStorage(); // Refresh from storage
    return pendingSubmissions.find(sub => sub.id === id) || null;
  }

  async updateSubmissionStatus(
    id: string, 
    status: 'approved' | 'rejected', 
    reviewNotes?: string, 
    actualSoundLevel?: number
  ): Promise<void> {
    pendingSubmissions = loadFromStorage(); // Refresh from storage
    const submissionIndex = pendingSubmissions.findIndex(sub => sub.id === id);
    if (submissionIndex === -1) {
      throw new Error(`Submission with ID ${id} not found`);
    }

    pendingSubmissions[submissionIndex] = {
      ...pendingSubmissions[submissionIndex],
      status,
      reviewedAt: new Date().toISOString(),
      reviewNotes,
      actualSoundLevel
    };

    saveToStorage(pendingSubmissions);
    console.log(`Submission ${id} updated to ${status}`);
  }

  async getSubmissionStats(): Promise<SubmissionStats> {
    pendingSubmissions = loadFromStorage(); // Refresh from storage
    const total = pendingSubmissions.length;
    const pending = pendingSubmissions.filter(sub => sub.status === 'pending').length;
    const approved = pendingSubmissions.filter(sub => sub.status === 'approved').length;
    const rejected = pendingSubmissions.filter(sub => sub.status === 'rejected').length;

    return { total, pending, approved, rejected };
  }

  async approveAndAddToItems(submissionId: string, actualSoundLevel: number): Promise<Item> {
    const submission = await this.getSubmissionById(submissionId);
    if (!submission) {
      throw new Error(`Submission with ID ${submissionId} not found`);
    }

    // Update submission status
    await this.updateSubmissionStatus(submissionId, 'approved', 'Approved and added to main database', actualSoundLevel);

    // Create and add new item to the main items collection
    const newItem = approvedItemsService.addApprovedItem({
      name: submission.name,
      soundLevel: actualSoundLevel,
      image: submission.imageUrl || 'https://images.unsplash.com/photo-1589149098258-3e9102cd63d3?q=80&w=400&h=300&auto=format&fit=crop',
      category: submission.category,
      description: submission.description
    });
    
    return newItem;
  }

  // Helper method to get all submissions (for admin interface)
  async getAllSubmissions(): Promise<PendingSubmission[]> {
    pendingSubmissions = loadFromStorage(); // Refresh from storage
    return [...pendingSubmissions];
  }

  // Helper method to delete a specific submission
  async deleteSubmission(id: string): Promise<void> {
    pendingSubmissions = loadFromStorage();
    const initialLength = pendingSubmissions.length;
    pendingSubmissions = pendingSubmissions.filter(sub => sub.id !== id);
    
    if (pendingSubmissions.length === initialLength) {
      throw new Error(`Submission with ID ${id} not found`);
    }
    
    saveToStorage(pendingSubmissions);
    console.log(`Submission ${id} deleted`);
  }

  // Helper method to search submissions
  async searchSubmissions(query: string): Promise<PendingSubmission[]> {
    pendingSubmissions = loadFromStorage();
    if (!query.trim()) {
      return [...pendingSubmissions];
    }
    
    const lowercaseQuery = query.toLowerCase();
    return pendingSubmissions.filter(sub =>
      sub.name.toLowerCase().includes(lowercaseQuery) ||
      sub.category.toLowerCase().includes(lowercaseQuery) ||
      sub.description.toLowerCase().includes(lowercaseQuery) ||
      sub.submitterName.toLowerCase().includes(lowercaseQuery) ||
      sub.submitterEmail.toLowerCase().includes(lowercaseQuery) ||
      sub.status.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Helper method to filter submissions by status
  async getSubmissionsByStatus(status: PendingSubmission['status']): Promise<PendingSubmission[]> {
    pendingSubmissions = loadFromStorage();
    return pendingSubmissions.filter(sub => sub.status === status);
  }

  // Helper method to clear all submissions (for testing)
  async clearAllSubmissions(): Promise<void> {
    pendingSubmissions = [];
    nextId = 1;
    saveToStorage(pendingSubmissions);
    saveNextId(nextId);
  }
}

// Singleton instance
export const pendingSubmissionService = new JsonPendingSubmissionDataSource();

// Helper functions for the submission form
export const submitNewItem = async (submissionData: Omit<PendingSubmission, 'id' | 'status' | 'submittedAt'>): Promise<string> => {
  return pendingSubmissionService.submitItem(submissionData);
};

export const getPendingSubmissionsCount = async (): Promise<number> => {
  const stats = await pendingSubmissionService.getSubmissionStats();
  return stats.pending;
};