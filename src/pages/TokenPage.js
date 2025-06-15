import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import TokenInfo from '../components/token/TokenInfo';
import { getCombinedTokenData } from '../services/tokenService';
import TokenChart from '../components/token/TokenChart';

const TokenPage = () => {
  const { baseTokenAddress } = useParams();
  const location = useLocation();
  const [token, setToken] = useState(location.state?.tokenData || null);
  const [loading, setLoading] = useState(!token);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token && baseTokenAddress) {
      setLoading(true);
      setError(null);
      getCombinedTokenData(baseTokenAddress)
        .then(data => {
          setToken(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching token data:', error);
          setError('Failed to load token data');
          setLoading(false);
        });
    }
  }, [baseTokenAddress, token]);

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
