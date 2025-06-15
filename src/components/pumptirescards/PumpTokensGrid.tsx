import React, { useEffect, useState } from 'react';
import { getAllTokensWithLiveData } from '../../services/tokenService';

interface Token {
  address: string;
  name: string;
  symbol: string;
  image_url?: string;
  description?: string;
  web?: string;
  telegram?: string;
  twitter?: string;
  creator_address?: string;
  price?: number;
  priceNative?: string;
  volume24h?: number;
  txns24h?: number;
  liquidity?: number;
  marketCap?: number;
  priceChange24h?: number;
}

interface TokenCardProps {
  token: Token;
}

const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
  return (
    <div className="bg-dex-bg-secondary rounded-lg p-4 shadow-lg">
      <div className="flex items-center mb-4">
        <img
          src={token.image_url || "/images/tokens/default-token.svg"}
          alt={token.symbol}
          className="w-12 h-12 rounded-full mr-3 bg-dex-bg-tertiary"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = "/images/tokens/default-token.svg";
          }}
        />
        <div>
          <h3 className="font-medium text-dex-text-primary">{token.name}</h3>
          <div className="text-sm text-dex-text-secondary">{token.symbol}</div>
        </div>
      </div>
      {token.price && (
        <div className="text-lg font-medium text-dex-text-primary mb-2">
          ${token.price.toFixed(6)}
        </div>
      )}
      {token.priceChange24h !== undefined && (
        <div className={`text-sm ${token.priceChange24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {token.priceChange24h > 0 ? '↑' : '↓'} {Math.abs(token.priceChange24h).toFixed(2)}%
        </div>
      )}
    </div>
  );
};

const PumpTokensGrid: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const data = await getAllTokensWithLiveData();
        setTokens(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError('Failed to fetch tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {tokens.map(token => (
        <TokenCard key={token.address} token={token} />
      ))}
    </div>
  );
};

export default PumpTokensGrid; 