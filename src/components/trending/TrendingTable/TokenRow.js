// components/trending/TrendingTable/TokenRow.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCombinedTokenData } from "../../../services/tokenService";
import { getTokenLogoUrl, formatPrice } from "../../../utils/formatters";

const getIpfsImage = (cid) => {
  if (!cid) return null;
  return `https://ipfs.io/ipfs/${cid}`;
};

const TokenRow = ({ token, rank }) => {
  console.log("TokenRow received token:", token);
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState(token);
  const [loading, setLoading] = useState(true);
  const [enrichedToken, setEnrichedToken] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchTokenData = async () => {
      try {
        const data = await getCombinedTokenData(token);
        console.log(`TokenRow fetched data for ${token.symbol}:`, data);
        
        if (isMounted) {
          // Merge token data with fallbacks
          const mergedData = {
            ...token,
            ...data,
            // Ensure we have fallback values for key metrics
            liquidity: token.liquidity || token.market_value || data.liquidity || 0,
            volume24h: token.volume24h || token.volume || token.dailyVolumeUSD || data.volume24h || 0,
            price: token.price || data.price || 0,
            priceChange24h: token.priceChange24h || data.priceChange24h || 0,
            symbol: token.symbol || data.symbol || 'N/A',
            name: token.name || data.name || 'N/A'
          };
          console.log(`TokenRow merged data for ${token.symbol}:`, mergedData);
          setTokenData(mergedData);
          setEnrichedToken(mergedData);
        }
      } catch (error) {
        console.error(`TokenRow error fetching data for ${token.symbol}:`, error);
        if (isMounted) {
          // Set fallback data if fetch fails
          const fallbackData = {
            ...token,
            liquidity: token.liquidity || token.market_value || 0,
            volume24h: token.volume24h || token.volume || token.dailyVolumeUSD || 0,
            price: token.price || 0,
            priceChange24h: token.priceChange24h || 0,
            symbol: token.symbol || 'N/A',
            name: token.name || 'N/A'
          };
          setTokenData(fallbackData);
          setEnrichedToken(fallbackData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTokenData();
    return () => { isMounted = false; };
  }, [token]);

  const handleTokenClick = () => {
    navigate(`/token/${token.address}`, { state: { tokenData } });
  };

  // Using the same image URL logic as TokenInfo.js
  const getImageUrl = () => {
    if (tokenData.image_url) return tokenData.image_url;
    if (tokenData.image_cid) return getIpfsImage(tokenData.image_cid);
    if (tokenData.logo) return getTokenLogoUrl(tokenData);
    return "/images/tokens/default-token.svg";
  };

  const mergedToken = { ...token, ...tokenData, ...enrichedToken };
  console.log(`TokenRow final merged token for ${token.symbol}:`, mergedToken);

  return (
    <tr onClick={handleTokenClick} className="cursor-pointer neon-table-row neon-border">
      <td className="px-4 py-3 text-dex-text-tertiary text-center">{rank}</td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          <img
            src={getImageUrl()}
            alt={mergedToken.symbol || ''}
            className="w-8 h-8 rounded-full mr-3 bg-dex-bg-tertiary"
            onError={e => { e.target.src = "/images/tokens/default-token.svg"; }}
          />
          <div>
            <div className="font-medium neon-text flex items-center gap-1">
              <span>{mergedToken.symbol || 'N/A'}</span>
            </div>
            <div className="text-xs text-dex-text-secondary">{mergedToken.name || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right neon-text">
        {mergedToken.price ? formatPrice(mergedToken.price) : 'N/A'}
      </td>
      <td className="px-4 py-3 text-right">
        <span className={mergedToken.priceChange24h > 0 ? 'text-green-500' : mergedToken.priceChange24h < 0 ? 'text-red-500' : 'text-dex-text-secondary'}>
          {mergedToken.priceChange24h !== undefined && mergedToken.priceChange24h !== null
            ? `${mergedToken.priceChange24h > 0 ? "↑" : mergedToken.priceChange24h < 0 ? "↓" : ""}${Math.abs(mergedToken.priceChange24h).toFixed(2)}%`
            : 'N/A'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {mergedToken.volume24h
          ? `$${Number(mergedToken.volume24h).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          : mergedToken.volume
          ? `$${Number(mergedToken.volume).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          : mergedToken.dailyVolumeUSD
          ? `$${Number(mergedToken.dailyVolumeUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          : 'N/A'}
      </td>
      <td className="px-4 py-3 text-right">
        {mergedToken.liquidity 
          ? `$${Number(mergedToken.liquidity).toLocaleString(undefined, { maximumFractionDigits: 2 })}` 
          : mergedToken.market_value 
          ? `$${Number(mergedToken.market_value).toLocaleString(undefined, { maximumFractionDigits: 2 })}` 
          : 'N/A'}
      </td>
    </tr>
  );
};

export default TokenRow;
