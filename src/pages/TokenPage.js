import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import TokenInfo from '../components/token/TokenInfo';
import { getCombinedTokenData, getPumpTokens } from '../services/tokenService';
import TokenChart from '../components/token/TokenChart';

const TokenPage = () => {
  const { address } = useParams();
  const location = useLocation();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTokenData = async () => {
      setLoading(true);
      try {
        // Use token from navigation if available
        const initialToken = location.state?.tokenData;
        if (initialToken && initialToken.address.toLowerCase() === address.toLowerCase()) {
          setToken(initialToken);
          setLoading(false);
          return;
        }

        // Load pump tokens first
        const tokens = await getPumpTokens();
        const foundToken = tokens.find(
          t => t.address.toLowerCase() === address.toLowerCase()
        );

        if (foundToken) {
          setToken(foundToken);
        } else {
          // Fallback: try DexScreener-only live data
          const fallbackData = await getCombinedTokenData(address);
          setToken(fallbackData || null);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading token data:', err);
        setError('Failed to load token data');
        setLoading(false);
      }
    };

    loadTokenData();
  }, [address, location.state]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <div className="text-dex-text-secondary">Loading token data...</div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="p-4 text-red-500">
        {error || 'Token not found.'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 w-full">
          <TokenChart token={token} />
        </div>
        <div className="lg:w-1/3 w-full">
          <TokenInfo token={token} />
        </div>
      </div>
    </div>
  );
};

export default TokenPage;
