import axios from 'axios';

const BASE_URL: string = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error('API_URL is not defined');
}

export const apiConfig = {
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
  },
};

