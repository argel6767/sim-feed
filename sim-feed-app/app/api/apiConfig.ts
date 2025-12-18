import axios from 'axios';

const BASE_URL: string = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error('API_URL is not defined');
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

