import { getTokenInfo } from './dexScreenerService';

/**
 * Fetches the local pump tokens data from pump_tokens.json
 * @returns {Promise<Array>} Array of pump token data
 */
export const getPumpTokens = async () => {
  try {
    // Use absolute path from public directory
    const response = await fetch(`${process.env.PUBLIC_URL}/pump_tokens.json?v=${Date.now()}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pump tokens data: ${response.status}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid pump tokens data format');
    }
    return data;
  } catch (error) {
    console.error('Error fetching pump tokens:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

/**
 * Gets a single token's data from pump_tokens.json
 * @param {string} address - Token address to fetch
 * @returns {Promise<Object|null>} Token data or null if not found
 */
export const getPumpTokenByAddress = async (address) => {
  if (!address) {
    console.warn('getPumpTokenByAddress: No address provided');
    return null;
  }

  try {
    const tokens = await getPumpTokens();
    const normalizedAddress = address.toLowerCase().trim();
    
    const token = tokens.find(t => {
      // Handle both string and object address properties
      const tokenAddress = typeof t.address === 'string' ? t.address.toLowerCase().trim() : '';
      return tokenAddress === normalizedAddress;
    });

    if (!token) {
      console.warn(`getPumpTokenByAddress: No token found for address ${address}`);
    }
    
    return token || null;
  } catch (error) {
    console.error('Error fetching pump token by address:', error);
    return null;
  }
};

/**
 * Combines static pump token data with live DexScreener data
 * @param {Object|string} tokenOrAddress - Either a token object from pump_tokens.json or just the token address
 * @returns {Promise<Object>} Combined token data
 */
export const getCombinedTokenData = async (tokenOrAddress) => {
  let pumpToken = null;
  
  try {
    console.log("getCombinedTokenData: Input:", typeof tokenOrAddress === 'string' ? tokenOrAddress : JSON.stringify(tokenOrAddress, null, 2));
    
    // If only address is provided, get the static data first
    pumpToken = typeof tokenOrAddress === 'string' 
      ? await getPumpTokenByAddress(tokenOrAddress)
      : tokenOrAddress;

    console.log("getCombinedTokenData: Pump token data:", JSON.stringify(pumpToken, null, 2));

    if (!pumpToken) {
      console.warn("getCombinedTokenData: No pump token data found, creating minimal object");
      // If token not found in pump_tokens.json, create minimal object with address
      pumpToken = { 
        address: typeof tokenOrAddress === 'string' ? tokenOrAddress : tokenOrAddress.address 
      };
    }

    // Get live data from DexScreener
    console.log("getCombinedTokenData: Fetching DexScreener data for address:", pumpToken.address);
    const dexData = await getTokenInfo(pumpToken.address);
    console.log("getCombinedTokenData: DexScreener data:", JSON.stringify(dexData, null, 2));
    
    // Combine the data, prioritizing DexScreener data for live metrics
    const combinedData = {
      // Static data from pump_tokens.json
      address: pumpToken.address,
      name: pumpToken.name || dexData.name,
      symbol: pumpToken.symbol || dexData.symbol,
      image_url: pumpToken.image_url,
      image_cid: pumpToken.image_cid,
      description: pumpToken.description,
      web: pumpToken.web,
      telegram: pumpToken.telegram,
      twitter: pumpToken.twitter,
      creator_address: pumpToken.creator_address,
      projectInfo: pumpToken.projectInfo,
      pair_address: pumpToken.pair_address, // Make sure pair_address is included
      
      // Live data from DexScreener
      price: dexData.price,
      priceNative: dexData.priceNative,
      volume24h: dexData.volume24h,
      txns24h: dexData.txns24h,
      liquidity: dexData.liquidity,
      marketCap: dexData.marketCap,
      fdv: dexData.fdv,
      pairAddress: dexData.pairAddress,
      dexId: dexData.dexId,
      chainId: dexData.chainId,
      priceChange24h: dexData.priceChange24h,
      priceChange1h: dexData.priceChange1h,
      priceChange7d: dexData.priceChange7d,
      txns: dexData.txns,
      volume: dexData.volume,
      buyers: dexData.buyers,
      sellers: dexData.sellers,
      makers: dexData.makers,
      links: dexData.links,
      rank: dexData.rank,
      badges: dexData.badges,
      quoteToken: dexData.quoteToken,
      projectInfo: dexData.projectInfo || pumpToken.projectInfo
    };
    
    console.log("getCombinedTokenData: Final combined data:", JSON.stringify(combinedData, null, 2));
    return combinedData;
  } catch (error) {
    console.error('Error combining token data:', error);
    // Return just the pump token data if DexScreener fails
    // If pumpToken is null, return a minimal object with just the address
    const fallbackData = pumpToken || { 
      address: typeof tokenOrAddress === 'string' ? tokenOrAddress : tokenOrAddress.address 
    };
    console.log("getCombinedTokenData: Returning fallback data:", JSON.stringify(fallbackData, null, 2));
    return fallbackData;
  }
};

/**
 * Gets all pump tokens with their live data
 * @returns {Promise<Array>} Array of combined token data
 */
export const getAllTokensWithLiveData = async () => {
  try {
    const pumpTokens = await getPumpTokens();
    const combinedTokens = await Promise.all(
      pumpTokens.map(token => getCombinedTokenData(token))
    );
    return combinedTokens;
  } catch (error) {
    console.error('Error getting all tokens with live data:', error);
    throw error;
  }
}; 