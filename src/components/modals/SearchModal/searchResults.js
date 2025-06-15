import React from "react";
import { useNavigate } from "react-router-dom";
import { formatNumber, formatPrice, getTokenLogoUrl } from "../../../utils/formatters";

const getIpfsImage = (cid) => {
  if (!cid) return null;
  return `https://ipfs.io/ipfs/${cid}`;
};

const getImageUrl = (token) => {
  if (token.image_url) return token.image_url;
  if (token.image_cid) return getIpfsImage(token.image_cid);
  if (token.logo) return getTokenLogoUrl(token);
  return "/images/tokens/default-token.svg";
};

const SearchResults = ({ results, onClose }) => {
  const navigate = useNavigate();

  const handleTokenClick = (token) => {
    navigate(`/token/${token.address}`, {
      state: { tokenData: token }
    });
    onClose();
  };

  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-dex-text-secondary">
        No tokens found
      </div>
    );
  }

  return (
    <div>
      {results.map((token) => (
        <div
          key={token.address}
          className="p-4 hover:bg-dex-bg-highlight cursor-pointer border-b border-dex-border flex items-center"
          onClick={() => handleTokenClick(token)}
        >
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0 mr-3">
              <img
                src={getImageUrl(token)}
                alt={token.symbol}
                className="w-10 h-10 rounded-full bg-dex-bg-tertiary"
                onError={(e) => {
                  e.target.src = "/images/tokens/default-token.svg";
                }}
              />
            </div>
            <div>
              <div className="font-medium flex items-center gap-1">
                <span className="text-dex-text-primary">{token.symbol}</span>
              </div>
              <div className="text-sm text-dex-text-secondary">{token.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-dex-text-primary">
              {formatPrice(token.price)}
            </div>
            <div className="text-xs text-dex-text-secondary mt-1">
              Vol: {token.volume24h !== undefined && token.volume24h !== null && token.volume24h > 0 ? formatNumber(token.volume24h) : 'N/A'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
