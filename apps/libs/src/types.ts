export interface ApiResponse<T> {
  data: T | null;
  timestamp: string;
  statusCode: number;
}
