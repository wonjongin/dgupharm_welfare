import axios from 'axios';
import type { TokenResponse } from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const login = (sid: string, name: string): Promise<TokenResponse> =>
  axios.post(`${BASE}/api/v1/auth/login`, { sid, name }).then((r) => r.data);

export const register = (sid: string, name: string): Promise<TokenResponse> =>
  axios.post(`${BASE}/api/v1/auth/register`, { sid, name }).then((r) => r.data);
