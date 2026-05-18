const raw = process.env.NEXT_PUBLIC_API_URL;

if (!raw && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_API_URL must be set in production');
}

const ensureApiPath = (url: string) => {
  try {
    const parsed = new URL(url);
    // avoid double-slash when joining
    if (parsed.pathname.endsWith('/api')) return url.replace(/\/$/, '');
    if (parsed.pathname === '/' || parsed.pathname === '') return url.replace(/\/$/, '') + '/api';
    return url.replace(/\/$/, '') + '/api';
  } catch (e) {
    // if it's not a full URL (unlikely), fallback to raw
    return url.replace(/\/$/, '') + '/api';
  }
};

export const API_BASE_URL_VALUE = raw ? ensureApiPath(raw) : 'http://localhost:5000/api';

export default API_BASE_URL_VALUE;
