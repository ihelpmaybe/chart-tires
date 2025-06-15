import { useState, useEffect } from 'react';
import { getPumpTokens } from '../services/tokenService';

export type Token = {
  tokenAddress: string;
  name?: string;
  symbol?: string;
  priceUsd?: string;
  marketCap?: string;
  createdAt?: string;
  logo?: string;
};

export type UseTokensResult = {
  newTokens: Token[];
  bondingTokens: Token[];
  graduatedTokens: Token[];
  loading: boolean;
  error: string | null;
};

function unixToIsoString(unixSeconds: string | number | undefined): string {
  if (!unixSeconds) return '';
  const ms = Number(unixSeconds) * 1000;
  return new Date(ms).toISOString();
}

function formatPLS(price: string | number | undefined): string {
  if (!price) return '0.000000 PLS';
  return `${Number(price).toFixed(6)} PLS`;
}

function formatNumber(num: string | number | undefined): string {
  if (!num) return '0';
  return Number(num).toLocaleString();
}

function mapToken(raw: any): Token {
  return {
    tokenAddress: raw.address,
    symbol: raw.symbol,
    name: raw.name,
    priceUsd: formatPLS(raw.price),
    marketCap: formatNumber(raw.marketCap),
    createdAt: unixToIsoString(raw.createdAt),
    logo: raw.image_cid ? `https://ipfs.io/ipfs/${raw.image_cid}` : undefined,
  };
}

export function useTokens(): UseTokensResult {
  const [newTokens, setNewTokens] = useState<Token[]>([]);
  const [bondingTokens, setBondingTokens] = useState<Token[]>([]);
  const [graduatedTokens, setGraduatedTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchAndProcessTokens = async () => {
      try {
        const allTokens = await getPumpTokens();
        
        if (!cancelled) {
          // Sort tokens by creation date for new tokens
          const sortedByCreation = [...allTokens].sort((a, b) => {
            const aDate = new Date(a.createdAt || 0).getTime();
            const bDate = new Date(b.createdAt || 0).getTime();
            return bDate - aDate;
          });
          
          // Sort tokens by market cap for bonding tokens
          const sortedByMarketCap = [...allTokens].sort((a, b) => {
            const aCap = Number(a.marketCap || 0);
            const bCap = Number(b.marketCap || 0);
            return bCap - aCap;
          });
          
          // Filter graduated tokens based on liquidity and volume
          const graduated = allTokens.filter(token => {
            const liquidity = Number(token.liquidity) || 0;
            const volume = Number(token.volume24h) || 0;
            return liquidity > 10000 || volume > 5000;
          });

          setNewTokens(sortedByCreation.slice(0, 10).map(mapToken));
          setBondingTokens(sortedByMarketCap.slice(0, 10).map(mapToken));
          setGraduatedTokens(graduated.slice(0, 10).map(mapToken));
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching tokens:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAndProcessTokens();

    return () => {
      cancelled = true;
    };
  }, []);

  return { newTokens, bondingTokens, graduatedTokens, loading, error };
} 