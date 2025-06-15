// services/api.js

import { 
  fetchWithRetry, 
  measureApiPerformance, 
  getCachedTokenData, 
  setCachedTokenData,
} from '../utils/apiOptimizations';
import { enrichTokenList } from "../utils/mapTokenDetails";
import { getCombinedTokenData, getPumpTokenByAddress, getPumpTokens } from "../services/tokenService";

// PulseChain endpoints
const PULSECHAIN_RPC = "https://rpc.pulsechain.com";
const PULSECHAIN_EXPLORER = "https://scan.pulsechain.com/api";

// PulseX subgraph
const PULSEX_SUBGRAPH = "https://graph.pulsechain.com/subgraphs/name/pulsechain/pulsex";

// Helper function to make RPC calls to PulseChain
const makeRPCCall = async (method, params = []) => {
  const cacheKey = `rpc_${method}_${JSON.stringify(params)}`;
  const cached = getCachedTokenData(cacheKey);
  if (cached) return cached;

  try {
    const response = await measureApiPerformance(
      () => fetchWithRetry(PULSECHAIN_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method,
          params,
        }),
      }),
      `rpcCall_${method}`
    );

    if (!response.ok) {
      throw new Error(`RPC error: ${response.status}`);
    }

    const data = await response.json();
    setCachedTokenData(cacheKey, data.result);
    return data.result;
  } catch (error) {
    console.error(`RPC call error (${method}):`, error);
    throw error;
  }
};

// Helper function to make GraphQL queries to PulseX Subgraph
const makeSubgraphQuery = async (query, variables = {}) => {
  const cacheKey = `subgraph_${query}_${JSON.stringify(variables)}`;
  const cached = getCachedTokenData(cacheKey);
  if (cached) return cached;

  try {
    const response = await measureApiPerformance(
      () => fetchWithRetry(PULSEX_SUBGRAPH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      }),
      `subgraphQuery_${query.slice(0, 20)}`
    );

    if (!response.ok) {
      throw new Error(`Subgraph error: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`Subgraph query error: ${data.errors[0].message}`);
    }

    setCachedTokenData(cacheKey, data.data);
    return data.data;
  } catch (error) {
    console.error('Subgraph query error:', error);
    throw error;
  }
};

function formatUSD(num) {
  num = Number(num);
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

/**
 * Get wallet token balances on PulseChain
 * @param {string} address - Wallet address
 * @returns {Promise} Promise resolving to wallet token balances
 */
export const getWalletTokens = async (address) => {
  try {
    // Get token balances using PulseChain explorer API
    const response = await fetch(
      `${PULSECHAIN_EXPLORER}/address/${address}/tokens`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const tokens = await response.json();
    
    // Get detailed token data from local pump_tokens.json
    const tokensWithData = await Promise.all(
      tokens.map(async (token) => {
        try {
          // Use getCombinedTokenData from tokenService instead
          const tokenData = await getCombinedTokenData(token.address);
          return {
            ...token,
            ...tokenData,
            value: (token.balance / Math.pow(10, token.decimals)) * (tokenData.price || 0)
          };
        } catch (error) {
          console.error(`Error getting data for token ${token.address}:`, error);
          return {
            ...token,
            price: 0,
            value: 0
          };
        }
      })
    );

    return tokensWithData;
  } catch (error) {
    console.error("Error fetching wallet tokens:", error);
    throw error;
  }
};

/**
 * Get wallet net worth on PulseChain
 * @param {string} address - Wallet address
 * @returns {Promise} Promise resolving to wallet net worth data
 */
export const getWalletNetWorth = async (address) => {
  try {
    const tokens = await getWalletTokens(address);
    
    // Calculate total value
    const totalValue = tokens.reduce((sum, token) => sum + (token.value || 0), 0);
    
    // Get native PLS balance
    const plsBalance = await makeRPCCall('eth_getBalance', [address, 'latest']);
    const plsData = await getCombinedTokenData('0x0000000000000000000000000000000000000000'); // PLS token address
    
    const plsValue = (parseInt(plsBalance, 16) / 1e18) * (plsData.price || 0);
    
    return {
      totalValue: totalValue + plsValue,
      tokens: tokens,
      nativeBalance: {
        symbol: 'PLS',
        balance: parseInt(plsBalance, 16) / 1e18,
        value: plsValue
      }
    };
  } catch (error) {
    console.error("Error fetching wallet net worth:", error);
    throw error;
  }
};

// Export chain-specific constants
export const CHAIN_INFO = {
  id: 'pulse',
  name: 'PulseChain',
  rpc: PULSECHAIN_RPC,
  explorer: PULSECHAIN_EXPLORER,
  nativeCurrency: {
    name: 'Pulse',
    symbol: 'PLS',
    decimals: 18
  }
};

/**
 * Get token data from local pump_tokens.json
 * @param {string} address - The token address
 * @returns {Promise<Object|null>} The token data or null if not found
 */
export async function getTokenData(address) {
  try {
    const token = await getPumpTokenByAddress(address);
    if (!token) return null;
    
    // Get live data from DexScreener
    const combinedData = await getCombinedTokenData(token);
    return combinedData;
  } catch (error) {
    console.error('Error getting token data:', error);
    return null;
  }
}

/**
 * Get multiple tokens' data from local pump_tokens.json
 * @param {string[]} addresses - Array of token addresses
 * @returns {Promise<Object[]>} Array of token data
 */
export async function getTokensData(addresses) {
  try {
    const allTokens = await getPumpTokens();
    const tokens = allTokens.filter(token => addresses.includes(token.address));
    
    // Get live data for each token
    const tokensWithLiveData = await Promise.all(
      tokens.map(token => getCombinedTokenData(token))
    );
    
    return tokensWithLiveData;
  } catch (error) {
    console.error('Error getting tokens data:', error);
    return [];
  }
}

/**
 * Fetch PulseX pair data using DexScreener API
 * @param {string|null} pairAddress - The pair address to fetch data for (or null to search)
 * @param {string} tokenAddress - The token address to use for fallback search
 * @param {string[]} preferredQuotes - Array of quote token symbols to prioritize (e.g. ["PLS", "WPLS", "DAI"])
 * @returns {Promise<Object|null>} Promise resolving to pair data or null if not found
 */
export async function fetchPulseXPairData(pairAddress, tokenAddress, preferredQuotes = ["PLS", "WPLS"]) {
  try {
    if (pairAddress) {
      // Try direct pair fetch first
      const url = `https://api.dexscreener.com/latest/dex/pairs/pulsechain/${pairAddress}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.pairs && data.pairs[0]) {
          const pair = data.pairs[0];
          return {
            pairAddress: pair.pairAddress,
            baseToken: pair.baseToken,
            quoteToken: pair.quoteToken,
            priceUsd: pair.priceUsd,
            volume24h: pair.volume24h,
            liquidityUsd: pair.liquidityUsd,
            txns24h: pair.txns24h,
            dexId: pair.dexId,
            chainId: pair.chainId
          };
        }
      }
    }
    // Fallback to search endpoint
    if (!tokenAddress) {
      console.warn("No tokenAddress provided for fallback search.");
      return null;
    }
    const searchUrl = `https://api.dexscreener.com/latest/dex/search?q=${tokenAddress}`;
    const searchResp = await fetch(searchUrl);
    if (!searchResp.ok) {
      console.warn("DexScreener search failed for token:", tokenAddress);
      return null;
    }
    const searchData = await searchResp.json();
    if (!searchData.pairs || !Array.isArray(searchData.pairs)) {
      console.warn("No pairs found in DexScreener search for token:", tokenAddress);
      return null;
    }
    // Find all pulsex pairs with token as base and preferred quote
    const matches = searchData.pairs.filter(pair =>
      pair.dexId === "pulsex" &&
      pair.baseToken.address.toLowerCase() === tokenAddress.toLowerCase() &&
      preferredQuotes.some(q => pair.quoteToken.symbol.toUpperCase().includes(q))
    );
    // Pick the one with the highest liquidity
    const best = matches.sort((a, b) => Number(b.liquidityUsd) - Number(a.liquidityUsd))[0];
    if (best) {
      return {
        pairAddress: best.pairAddress,
        baseToken: best.baseToken,
        quoteToken: best.quoteToken,
        priceUsd: best.priceUsd,
        volume24h: best.volume24h,
        liquidityUsd: best.liquidityUsd,
        txns24h: best.txns24h,
        dexId: best.dexId,
        chainId: best.chainId
      };
    }
    console.warn("No valid LP found for token:", tokenAddress);
    return null;
  } catch (error) {
    console.error("Error in fetchPulseXPairData:", error);
    return null;
  }
}

/**
 * Fetch token stats from PulseX subgraph
 * @param {string} address - Token address
 * @returns {Promise<Object>} - Stats object with price, volume24h, liquidity
 */
export const getTokenStatsFromSubgraph = async (address) => {
  const query = `
    query TokenStats($id: ID!) {
      token(id: $id) {
        id
        symbol
        name
        derivedUSD
        totalLiquidity
        tradeVolumeUSD
        dayData: tokenDayData(first: 1, orderBy: date, orderDirection: desc) {
          priceUSD
          dailyVolumeUSD
          totalLiquidity
        }
      }
    }
  `;
  const variables = { id: address.toLowerCase() };
  const data = await makeSubgraphQuery(query, variables);
  if (!data || !data.token) return {};
  const t = data.token;
  const day = t.dayData && t.dayData[0] ? t.dayData[0] : {};
  return {
    price: day.priceUSD || t.derivedUSD || null,
    volume24h: day.dailyVolumeUSD || t.tradeVolumeUSD || null,
    liquidity: day.totalLiquidity || t.totalLiquidity || null,
    name: t.name,
    symbol: t.symbol,
  };
};

// Update batchTokenData with optimizations
const batchTokenData = async (addresses) => {
  const cacheKey = `batch_tokens_${addresses.join('_')}`;
  const cached = getCachedTokenData(cacheKey);
  if (cached) return cached;

  const batch = addresses.map((address, index) => ({
    jsonrpc: '2.0',
    id: index + 1,
    method: 'eth_call',
    params: [{
      to: address,
      data: '0x313ce567' // decimals()
    }, 'latest']
  }));

  try {
    const response = await measureApiPerformance(
      () => fetchWithRetry(PULSECHAIN_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      }),
      'batchTokenData'
    );

    if (!response.ok) throw new Error(`Batch RPC error: ${response.status}`);
    const results = await response.json();
    const decimals = results.map(r => parseInt(r.result, 16));
    
    setCachedTokenData(cacheKey, decimals);
    return decimals;
  } catch (error) {
    console.error('Batch token data error:', error);
    throw error;
  }
};
