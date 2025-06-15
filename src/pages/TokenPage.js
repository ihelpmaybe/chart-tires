import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import TokenInfo from '../components/token/TokenInfo';
import { getCombinedTokenData, getPumpTokens } from '../services/tokenService';
import TokenChart from '../components/token/TokenChart';

const TokenPage = () => {
  const { address } = useParams();
  const location = useLocation();
  const [token, setToken] = useState(location.state?.tokenData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pumpTokens, setPumpTokens] = useState(null);

  useEffect(() => {
    const loadTokenData = async () => {
      try {
        // First try to get token from pump tokens list
        const tokens = await getPumpTokens();
        setPumpTokens(tokens);
        
        // Case-insensitive address comparison
        const foundToken = tokens.find(t => 
          t.address.toLowerCase() === address.toLowerCase()
        );

        if (foundToken) {
          // If we found the token in pump tokens, use that data
          setToken(foundToken);
          setLoading(false);
        } else if (!token) {
          // If not in pump tokens and we don't have token data, try fetching it
          const data = await getCombinedTokenData(address);
          setToken(data);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading token data:', error);
        setError('Failed to load token data');
        setLoading(false);
      }
    };

    loadTokenData();
  }, [address, token]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <div className="text-dex-text-secondary">Loading token data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-4 text-dex-text-secondary">
        Token not found
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
