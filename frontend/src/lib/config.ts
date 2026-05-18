const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_API_URL must be set in production');
}

export const API_BASE_URL_VALUE = API_BASE_URL || 'http://localhost:5000/api';

export default API_BASE_URL_VALUE;
