// src/utils/mapTokenDetails.js

import { getCombinedTokenData } from "../services/tokenService";

/**
 * Enrich a list of token base objects with combined data from pump_tokens.json and DexScreener
 * @param {Array<Object>} tokenList - List of tokens with `address`, `symbol`, etc.
 * @returns {Promise<Array<Object>>} Enriched token data
 */
export const enrichTokenList = async (tokenList) => {
  try {
    // Get combined data for each token
    const enriched = await Promise.all(
      tokenList.map(token => getCombinedTokenData(token))
    );
    return enriched;
  } catch (error) {
    console.error('Error enriching token list:', error);
    // Return original tokens if enrichment fails
    return tokenList;
  }
};
