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

// Pending submission interfaces
export interface PendingSubmission {
  id: string;
  name: string;
  estimatedSoundLevel: number;
  imageUrl: string;
  category: string;
  description: string;
  submitterName: string;
  submitterEmail: string;
  additionalInfo: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  actualSoundLevel?: number; // Set by admin after verification
}

export interface SubmissionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface PendingSubmissionDataSource {
  submitItem(submission: Omit<PendingSubmission, 'id' | 'status' | 'submittedAt'>): Promise<string>;
  getPendingSubmissions(): Promise<PendingSubmission[]>;
  getSubmissionById(id: string): Promise<PendingSubmission | null>;
  updateSubmissionStatus(id: string, status: 'approved' | 'rejected', reviewNotes?: string, actualSoundLevel?: number): Promise<void>;
  getSubmissionStats(): Promise<SubmissionStats>;
  approveAndAddToItems(submissionId: string, actualSoundLevel: number): Promise<Item>;
}