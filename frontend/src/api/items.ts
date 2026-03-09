import axios from 'axios';
import type { Item, ItemWithStatus, ItemCreate, ItemUpdate } from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const headers = (token: string) => ({ Authorization: `Bearer ${token}` });

export const getItems = (): Promise<Item[]> =>
  axios.get(`${BASE}/api/v1/items/`).then((r) => r.data);

export const getItemsByCategory = (categoryId: number): Promise<ItemWithStatus[]> =>
  axios.get(`${BASE}/api/v1/items/category/${categoryId}`).then((r) => r.data);

export const createItem = (item: ItemCreate, token: string): Promise<Item> =>
  axios.post(`${BASE}/api/v1/items/`, item, { headers: headers(token) }).then((r) => r.data);

export const updateItem = (id: number, item: ItemUpdate, token: string): Promise<Item> =>
  axios.put(`${BASE}/api/v1/items/${id}`, item, { headers: headers(token) }).then((r) => r.data);

export const deleteItem = (id: number, token: string): Promise<{ message: string }> =>
  axios.delete(`${BASE}/api/v1/items/${id}`, { headers: headers(token) }).then((r) => r.data);
