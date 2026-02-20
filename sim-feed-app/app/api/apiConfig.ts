import axios from 'axios';

const BASE_URL: string = import.meta.env.VITE_API_URL;
const USER_BASE_URL: string = import.meta.env.VITE_USER_API_URL;

if (!BASE_URL) {
  throw new Error('API_URL is not defined');
}

if (!USER_BASE_URL) {
  throw new Error('USER_API_URL is not defined');
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userApiClient = axios.create({
  baseURL: USER_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});

