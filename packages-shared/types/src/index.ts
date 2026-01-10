// Common TypeScript types for the project

export interface FileMetadata {
  fileId: string;
  name?: string;
  mimetype?: string;
  size?: number;
  dateCreated?: string;
}

export interface ApiResponse<T = any> {
  status: 'OK' | 'FAIL';
  data?: T;
  error?: string;
}
