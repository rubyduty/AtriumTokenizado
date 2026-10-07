import axios, { type AxiosError } from 'axios';
import type { ApiResponse, HealthData, LoginData, User } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('atrium_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error: unknown, fallback = 'Ha ocurrido un error'): string {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<ApiResponse<null>>;
    return ax.response?.data?.message || ax.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function healthCheck(): Promise<ApiResponse<HealthData>> {
  const { data } = await api.get<ApiResponse<HealthData>>('/api/health');
  return data;
}

export async function getUsers(): Promise<ApiResponse<User[]>> {
  const { data } = await api.get<ApiResponse<User[]>>('/api/users');
  return data;
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<ApiResponse<User>> {
  const { data } = await api.post<ApiResponse<User>>('/api/users', payload);
  return data;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<ApiResponse<LoginData>> {
  const { data } = await api.post<ApiResponse<LoginData>>('/api/auth/login', payload);
  return data;
}

export async function updateName(name: string): Promise<ApiResponse<User>> {
  const { data } = await api.patch<ApiResponse<User>>('/api/users/name', { name });
  return data;
}
