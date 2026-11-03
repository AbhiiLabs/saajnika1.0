import axios, { AxiosRequestConfig } from 'axios';

// Get or initialize persistent guest session key
export const getSessionKey = (): string => {
  let key = localStorage.getItem('saajnika_session_key');
  if (!key) {
    key = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('saajnika_session_key', key);
  }
  return key;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Real-Time Cross-Tab / Cross-Window Synchronization Channel
const syncChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('saajnika_cache_sync')
    : null;

if (syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data?.type === 'CLEAR_CACHE') {
      memoryCache.clear();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('saajnika:data_updated', { detail: event.data }));
      }
    }
  };
}

// Fast In-Memory Cache for Instant Navigation (0ms latency on repeated visits)
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh window for snappy navigation

export const clearApiCache = (prefix?: string) => {
  if (!prefix) {
    memoryCache.clear();
  } else {
    for (const key of memoryCache.keys()) {
      if (key.includes(prefix)) memoryCache.delete(key);
    }
  }

  // Broadcast to other tabs & current window components
  try {
    syncChannel?.postMessage({ type: 'CLEAR_CACHE', prefix });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('saajnika:data_updated', { detail: { prefix } }));
    }
  } catch {}
};

/**
 * Fast cached GET request with In-Flight Deduplication and Stale-While-Revalidate support
 */
export const cachedGet = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }> => {
  const cacheKey = url + (config?.params ? JSON.stringify(config.params) : '');
  const cached = memoryCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    // If cache is older than 15s, trigger a silent background revalidation
    if (now - cached.timestamp > 15000) {
      api.get<T>(url, config).then((res) => {
        memoryCache.set(cacheKey, { data: res.data, timestamp: Date.now() });
      }).catch(() => {});
    }
    return { data: cached.data };
  }

  // Deduplicate simultaneous in-flight requests for the same endpoint
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const requestPromise = api.get<T>(url, config)
    .then((res) => {
      memoryCache.set(cacheKey, { data: res.data, timestamp: Date.now() });
      inFlightRequests.delete(cacheKey);
      return res;
    })
    .catch((err) => {
      inFlightRequests.delete(cacheKey);
      throw err;
    });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

api.interceptors.request.use((config) => {
  const isAuthEndpoint = config.url && (
    config.url.includes('/auth/register/') ||
    config.url.includes('/auth/login/') ||
    config.url.includes('/auth/token/refresh/')
  );

  const token = localStorage.getItem('saajnika_access_token');
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!isAuthEndpoint) {
    config.headers['X-Session-Key'] = getSessionKey();
  } else if (config.headers && config.headers['X-Session-Key']) {
    delete config.headers['X-Session-Key'];
  }

  // Invalidate cache immediately on mutation requests
  if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
    clearApiCache();
  }

  return config;
});

export const safeArray = <T = any>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && (response.data.includes('<!doctype') || response.data.includes('<html'))) {
      const err = new Error('HTML response returned instead of JSON');
      (err as any).response = { ...response, status: 404 };
      return Promise.reject(err);
    }

    // When mutations successfully complete, clear cache and notify all components
    const method = response.config?.method?.toLowerCase();
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      clearApiCache();
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Immediately clear stale/invalid token if rejected by backend
    if (error.response?.data?.code === 'token_not_valid') {
      localStorage.removeItem('saajnika_access_token');
      localStorage.removeItem('saajnika_refresh_token');
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('saajnika_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('saajnika_access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('saajnika_access_token');
          localStorage.removeItem('saajnika_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
