import axios from 'axios';
import type { Rental } from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const headers = (token: string) => ({ Authorization: `Bearer ${token}` });

export const createRental = (itemUuid: string, token: string): Promise<Rental> =>
  axios.post(`${BASE}/api/v1/rentals/`, { item_uuid: itemUuid }, { headers: headers(token) }).then((r) => r.data);

export const returnRental = (itemUuid: string, token: string): Promise<Rental> =>
  axios.post(`${BASE}/api/v1/rentals/return`, { item_uuid: itemUuid }, { headers: headers(token) }).then((r) => r.data);

export const getMyRentals = (token: string): Promise<Rental[]> =>
  axios.get(`${BASE}/api/v1/rentals/my`, { headers: headers(token) }).then((r) => r.data);

export const getAllRentals = (token: string): Promise<Rental[]> =>
  axios.get(`${BASE}/api/v1/rentals/`, { headers: headers(token) }).then((r) => r.data);
