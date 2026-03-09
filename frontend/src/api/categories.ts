import axios from 'axios';
import type { Category } from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const headers = (token: string) => ({ Authorization: `Bearer ${token}` });

export const getCategories = (): Promise<Category[]> =>
  axios.get(`${BASE}/api/v1/categories/`).then((r) => r.data);

export const createCategory = (title: string, token: string): Promise<Category> =>
  axios.post(`${BASE}/api/v1/categories/`, { title }, { headers: headers(token) }).then((r) => r.data);

export const updateCategory = (id: number, title: string, token: string): Promise<Category> =>
  axios.put(`${BASE}/api/v1/categories/${id}`, { title }, { headers: headers(token) }).then((r) => r.data);

export const deleteCategory = (id: number, token: string): Promise<{ message: string }> =>
  axios.delete(`${BASE}/api/v1/categories/${id}`, { headers: headers(token) }).then((r) => r.data);
