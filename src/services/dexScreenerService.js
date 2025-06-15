/**
 * Service for interacting with DexScreener API
 */

const DEXSCREENER_API_BASE = 'https://api.dexscreener.com/latest/dex';

/**
 * Fetch detailed token information from DexScreener, combining with pump_tokens.json data
 * @param {Object} tokenData - Token data from pump_tokens.json
 * @returns {Promise<Object>} Promise resolving to combined token data
 */
export const getTokenInfo = async (tokenData) => {
  try {
    // If we only got an address, create minimal token object
    const address = typeof tokenData === 'string' ? tokenData : tokenData.address;
    const url = `${DEXSCREENER_API_BASE}/tokens/${address}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Get the pair with highest liquidity
    const pairs = data.pairs || [];
    const bestPair = pairs.sort((a, b) => 
      Number(b.liquidity?.usd || 0) - Number(a.liquidity?.usd || 0)
    )[0];

    if (!bestPair) {
      // If no DexScreener data, return just the pump token data
      return {
        ...tokenData,
        price: null,
        priceNative: null,
        volume24h: null,
        txns24h: null,
        liquidity: null,
        marketCap: null,
        priceChange24h: null,
        priceChange1h: null,
        priceChange7d: null
      };
    }

    // Combine pump_tokens.json data with live DexScreener data
    return {
      // Static data from pump_tokens.json (preserved)
      address: address,
      name: tokenData.name || bestPair.baseToken.name,
      symbol: tokenData.symbol || bestPair.baseToken.symbol,
      image_cid: tokenData.image_cid,
      description: tokenData.description,
      web: tokenData.web,
      telegram: tokenData.telegram,
      twitter: tokenData.twitter,
      creator_address: tokenData.creator_address,
      
      // Live data from DexScreener
      price: bestPair.priceUsd,
      priceNative: bestPair.priceNative,
      volume24h: bestPair.volume?.h24 ?? null,
      txns24h: bestPair.txns24h,
      liquidity: bestPair.liquidity?.usd,
      marketCap: bestPair.fdv,
      fdv: bestPair.fdv,
      pairAddress: bestPair.pairAddress,
      dexId: bestPair.dexId,
      chainId: bestPair.chainId,
      url: bestPair.url,
      priceChange24h: bestPair.priceChange?.h24 ?? null,
      priceChange1h: bestPair.priceChange?.h1 ?? null,
      priceChange7d: bestPair.priceChange?.h7 ?? null,
      txns: bestPair.txns,
      volume: bestPair.volume,
      buyers: bestPair.buyers,
      sellers: bestPair.sellers,
      makers: bestPair.makers,
      quoteToken: {
        address: bestPair.quoteToken.address,
        symbol: bestPair.quoteToken.symbol,
        name: bestPair.quoteToken.name
      }
    };
  } catch (error) {
    console.error('Error fetching token info from DexScreener:', error);
    // Return just the pump token data if DexScreener fails
    return {
      ...tokenData,
      price: null,
      priceNative: null,
      volume24h: null,
      txns24h: null,
      liquidity: null,
      marketCap: null,
      priceChange24h: null,
      priceChange1h: null,
      priceChange7d: null
    };
  }
};

/**
 * Search for tokens on DexScreener, combining with pump_tokens.json data
 * @param {string} query - Search query (token address, name, or symbol)
 * @returns {Promise<Array>} Promise resolving to array of combined token data
 */
export const searchTokens = async (query) => {
  try {
    // Search specifically on PulseChain
    const url = `${DEXSCREENER_API_BASE}/search?q=${encodeURIComponent(query)}&chainId=pulsechain`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process and deduplicate tokens
    const tokenMap = new Map();
    
    (data.pairs || []).forEach(pair => {
      // Only process PulseChain pairs
      if (pair.chainId !== "pulsechain" && pair.chainId !== "0x171") {
        return;
      }

      const tokenAddress = pair.baseToken.address.toLowerCase();
      if (!tokenMap.has(tokenAddress)) {
        tokenMap.set(tokenAddress, {
          address: pair.baseToken.address,
          // Only use DexScreener data for live metrics
          price: pair.priceUsd,
          priceNative: pair.priceNative,
          volume24h: pair.volume24h,
          txns24h: pair.txns24h,
          liquidity: pair.liquidity?.usd,
          marketCap: pair.fdv,
          pairAddress: pair.pairAddress,
          dexId: pair.dexId,
          chainId: pair.chainId,
          priceChange24h: typeof pair.priceChange24h === 'object' && pair.priceChange24h !== null ? pair.priceChange24h.h24 : pair.priceChange24h,
          priceChange1h: pair.priceChange1h,
          priceChange7d: pair.priceChange7d,
          quoteToken: {
            address: pair.quoteToken.address,
            symbol: pair.quoteToken.symbol,
            name: pair.quoteToken.name
          }
        });
      }
    });

    return Array.from(tokenMap.values());
  } catch (error) {
    console.error('Error searching tokens on DexScreener:', error);
    throw error;
  }
};

/**
 * Get trending tokens from DexScreener
 * @param {string} chainId - Chain ID to get trending tokens for (default: 'pulsechain')
 * @returns {Promise<Array>} Promise resolving to array of trending token data
 */
export const getTrendingTokens = async (chainId = 'pulsechain') => {
  try {
    const url = `${DEXSCREENER_API_BASE}/tokens/${chainId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Sort by volume and get top tokens
    const sortedPairs = (data.pairs || [])
      .sort((a, b) => Number(b.volume24h || 0) - Number(a.volume24h || 0))
      .slice(0, 20);

    // Deduplicate tokens and get best pair for each
    const tokenMap = new Map();
    
    sortedPairs.forEach(pair => {
      const tokenAddress = pair.baseToken.address.toLowerCase();
      if (!tokenMap.has(tokenAddress)) {
        tokenMap.set(tokenAddress, {
          address: pair.baseToken.address,
          name: pair.baseToken.name,
          symbol: pair.baseToken.symbol,
          price: pair.priceUsd,
          priceNative: pair.priceNative,
          volume24h: pair.volume24h,
          txns24h: pair.txns24h,
          liquidity: pair.liquidity?.usd,
          marketCap: pair.fdv,
          logo: pair.baseToken.logoUrl,
          pairAddress: pair.pairAddress,
          dexId: pair.dexId,
          chainId: pair.chainId,
          priceChange24h: typeof pair.priceChange24h === 'object' && pair.priceChange24h !== null ? pair.priceChange24h.h24 : pair.priceChange24h,
          priceChange1h: pair.priceChange1h,
          priceChange7d: pair.priceChange7d,
          quoteToken: {
            address: pair.quoteToken.address,
            symbol: pair.quoteToken.symbol,
            name: pair.quoteToken.name
          }
        });
      }
    });

    return Array.from(tokenMap.values());
  } catch (error) {
    console.error('Error fetching trending tokens from DexScreener:', error);
    throw error;
  }
};

/**
 * Fetches and filters token pair data from DexScreener API
 * @param {Object} tokenData - Token data from pump_tokens.json
 * @returns {Promise<Object>} Object containing chartUrl, imageUrl, and priceChange24h
 */
export const getDexScreenerPair = async (tokenData) => {
  try {
    console.log("getDexScreenerPair: Received token data:", JSON.stringify(tokenData, null, 2));
    
    // If we have a pair address from pump_tokens.json, use it directly
    if (tokenData.pair_address) {
      console.log("getDexScreenerPair: Using pair_address from token data:", tokenData.pair_address);
      const response = await fetch(
        `${DEXSCREENER_API_BASE}/pairs/pulsechain/${tokenData.pair_address}`
      );
      if (!response.ok) {
        console.warn("getDexScreenerPair: Failed to fetch pair data:", response.status);
        throw new Error(`DexScreener API error: ${response.status}`);
      }
      const data = await response.json();
      console.log("getDexScreenerPair: Pair data response:", JSON.stringify(data, null, 2));
      if (data.pairs && data.pairs[0]) {
        const pair = data.pairs[0];
        return {
          chartUrl: pair.url || null,
          pairAddress: pair.pairAddress,
          priceChange24h: typeof pair.priceChange24h === 'object' && pair.priceChange24h !== null 
            ? pair.priceChange24h.h24 
            : pair.priceChange24h
        };
      }
    }

    // Fallback to searching by token address
    console.log("getDexScreenerPair: Falling back to token address search:", tokenData.address);
    const response = await fetch(
      `${DEXSCREENER_API_BASE}/tokens/${tokenData.address}`
    );
    if (!response.ok) {
      console.warn("getDexScreenerPair: Failed to fetch token data:", response.status);
      throw new Error(`DexScreener API error: ${response.status}`);
    }
    const data = await response.json();
    console.log("getDexScreenerPair: Token search response:", JSON.stringify(data, null, 2));
    
    // Filter pairs to only include PulseX pairs
    const pulsexPairs = data.pairs.filter(pair => pair.dexId === "pulsex");
    console.log("getDexScreenerPair: Found PulseX pairs:", pulsexPairs.length);
    
    if (!pulsexPairs.length) {
      console.warn("getDexScreenerPair: No PulseX pairs found");
      return {
        chartUrl: null,
        pairAddress: null,
        priceChange24h: null
      };
    }

    // Sort by liquidity and get the highest liquidity pair
    const bestPair = pulsexPairs.sort((a, b) => 
      parseFloat(b.liquidity?.usd || 0) - parseFloat(a.liquidity?.usd || 0)
    )[0];
    console.log("getDexScreenerPair: Selected best pair:", JSON.stringify(bestPair, null, 2));

    return {
      chartUrl: bestPair.url || null,
      pairAddress: bestPair.pairAddress,
      priceChange24h: typeof bestPair.priceChange24h === 'object' && bestPair.priceChange24h !== null 
        ? bestPair.priceChange24h.h24 
        : bestPair.priceChange24h
    };
  } catch (error) {
    console.error("Error fetching DexScreener pair data:", error);
    return {
      chartUrl: null,
      pairAddress: null,
      priceChange24h: null
    };
  }
}; 