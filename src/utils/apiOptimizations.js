// import { subscribeToTokenUpdates } from '../services/api';

// // API optimization utilities

// // Cache implementation
const tokenCache = new Map();
const CACHE_TTL = 60000; // 1 minute

export const getCachedTokenData = (address) => {
  const cached = tokenCache.get(address);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

export const setCachedTokenData = (address, data) => {
  tokenCache.set(address, {
    timestamp: Date.now(),
    data
  });
};

// // Retry logic
export const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

// // Performance monitoring
export const measureApiPerformance = async (apiCall, name) => {
  const start = performance.now();
  try {
    const result = await apiCall();
    const duration = performance.now() - start;
    console.log(`${name} took ${duration}ms`);
    return result;
  } catch (error) {
    console.error(`${name} failed after ${performance.now() - start}ms`);
    throw error;
  }
};

// // WebSocket connection pooling
// const wsPool = new Map();

// export const getWebSocketConnection = (endpoint) => {
//   if (!wsPool.has(endpoint)) {
//     const ws = new WebSocket(endpoint);
//     wsPool.set(endpoint, ws);
//   }
//   return wsPool.get(endpoint);
// };

// // Subscription management
// const subscriptions = new Map();

// export const manageSubscription = (address, callback) => {
//   if (!subscriptions.has(address)) {
//     const unsubscribe = subscribeToTokenUpdates([address], callback);
//     subscriptions.set(address, unsubscribe);
//   }
//   return () => {
//     const unsubscribe = subscriptions.get(address);
//     if (unsubscribe) {
//       unsubscribe();
//       subscriptions.delete(address);
//     }
//   };
// }; 