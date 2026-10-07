export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginData {
  token: string;
  user: User;
  expiresAt: string;
}

export interface HealthData {
  status: string;
  database?: string;
}
