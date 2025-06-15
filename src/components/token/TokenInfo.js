// components/token/TokenInfo.js
import React, { useState } from 'react';
import { FaExternalLinkAlt, FaExchangeAlt, FaBolt, FaGlobe, FaTwitter, FaTelegram, FaRegCopy } from 'react-icons/fa';
import { getTokenLogoUrl, formatPrice, formatNumber, truncateAddress } from '../../utils/formatters';

const getIpfsImage = (cid) => {
  if (!cid) return null;
  return `https://ipfs.io/ipfs/${cid}`;
};

const TokenInfo = ({ token }) => {
  const [copied, setCopied] = useState(false);

  if (!token) {
    return <div className="p-4 text-dex-text-secondary">Token not found</div>;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSocialUrl = (type, url) => {
    if (!url) return '#';
    if (type === 'twitter' && !url.startsWith('http')) {
      return `https://twitter.com/${url.replace('@', '')}`;
    }
    if (type === 'telegram' && !url.startsWith('http')) {
      return `https://t.me/${url.replace('@', '')}`;
    }
    if (type === 'web' && !url.startsWith('http')) {
      return `https://${url}`;
    }
    return url;
  };

  // Get the best available image URL
  const getImageUrl = () => {
    if (token.image_url) return token.image_url;
    if (token.image_cid) return getIpfsImage(token.image_cid);
    if (token.logo) return getTokenLogoUrl(token);
    return "/images/tokens/default-token.svg";
  };

  // Get the best available social links
  const getSocialLinks = () => {
    return {
      web: token.web || token.links?.website,
      twitter: token.twitter || token.links?.twitter,
      telegram: token.telegram || token.links?.telegram
    };
  };

  const socialLinks = getSocialLinks();

  return (
    <div className="bg-dex-bg-secondary rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        {/* Token Header with Price Info */}
        <div className="flex items-center mb-6">
          <img
            src={getImageUrl()}
            alt={token.symbol}
            className="w-16 h-16 rounded-full mr-4 bg-dex-bg-tertiary"
            onError={e => { e.target.src = "/images/tokens/default-token.svg"; }}
          />
          <div>
            <h1 className="text-2xl font-bold neon-text">{token.name}</h1>
            <div className="text-dex-text-secondary">{token.symbol}</div>
          </div>
        </div>

        {/* Price and Change Info */}
        {token.price && (
          <div className="mb-6">
            <div className="text-2xl font-medium text-dex-text-primary">
              ${formatPrice(token.price)}
            </div>
            <div className="flex gap-4 mt-2">
              {typeof token.priceChange1h === 'number' && (
                <div className={`text-sm ${token.priceChange1h > 0 ? 'text-green-500' : token.priceChange1h < 0 ? 'text-red-500' : 'text-dex-text-secondary'}`}>
                  1h: {token.priceChange1h.toFixed(2)}%
                </div>
              )}
              {typeof token.priceChange24h === 'number' && (
                <div className={`text-sm ${token.priceChange24h > 0 ? 'text-green-500' : token.priceChange24h < 0 ? 'text-red-500' : 'text-dex-text-secondary'}`}>
                  24h: {token.priceChange24h.toFixed(2)}%
                </div>
              )}
              {typeof token.priceChange7d === 'number' && (
                <div className={`text-sm ${token.priceChange7d > 0 ? 'text-green-500' : token.priceChange7d < 0 ? 'text-red-500' : 'text-dex-text-secondary'}`}>
                  7d: {token.priceChange7d.toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        )}

        {/* Token Stats */}
        <div className="px-4 pt-4 pb-2 border-b border-dex-border">
          <div className="grid grid-cols-2 gap-4">
            {token.marketCap > 0 && (
              <div>
                <div className="text-sm text-dex-text-secondary">Market Cap</div>
                <div className="font-medium text-dex-text-primary">
                  {formatNumber(token.marketCap)}
                </div>
              </div>
            )}
            {token.liquidity > 0 && (
              <div>
                <div className="text-sm text-dex-text-secondary">Liquidity</div>
                <div className="font-medium text-dex-text-primary">
                  {formatNumber(token.liquidity)}
                </div>
              </div>
            )}
            {token.volume24h !== undefined && token.volume24h !== null && token.volume24h > 0 && (
              <div>
                <div className="text-sm text-dex-text-secondary">24h Volume</div>
                <div className="font-medium text-dex-text-primary">
                  {formatNumber(token.volume24h)}
                </div>
              </div>
            )}
            {token.txns24h > 0 && (
              <div>
                <div className="text-sm text-dex-text-secondary">24h Transactions</div>
                <div className="font-medium text-dex-text-primary">
                  {formatNumber(token.txns24h)}
                </div>
              </div>
            )}
            {token.txns?.h24?.buys > 0 && (
              <div>
                <div className="text-sm text-dex-text-secondary">Buys (24h)</div>
                <div className="font-medium text-dex-text-primary">
                  {formatNumber(token.txns.h24.buys)}
                </div>
              </div>
            )}
            {token.txns?.h24?.sells > 0 && (
              <div>
                <div className="text-sm text-dex-text-secondary">Sells (24h)</div>
                <div className="font-medium text-dex-text-primary">
                  {formatNumber(token.txns.h24.sells)}
                </div>
              </div>
            )}
            {token.volume?.h24?.buy > 0 && (
              <div>
                <div className="text-sm text-dex-text-secondary">Buy Volume (24h)</div>
                <div className="font-medium text-dex-text-primary">
                  {formatNumber(token.volume.h24.buy)}
                </div>
              </div>
            )}
            {token.volume?.h24?.sell > 0 && (
              <div>
                <div className="text-sm text-dex-text-secondary">Sell Volume (24h)</div>
                <div className="font-medium text-dex-text-primary">
                  {formatNumber(token.volume.h24.sell)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Token Address and Links */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-medium text-dex-text-secondary">Token address</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-dex-bg-tertiary transition"
              title="Copy address"
            >
              <FaRegCopy className="inline-block" />
              <span className="font-mono text-dex-text-primary">{truncateAddress(token.address)}</span>
            </button>
            {copied && (
              <span className="text-xs text-green-400 ml-1">Copied!</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <a
              href={`https://scan.mypinata.cloud/ipfs/bafybeih3olry3is4e4lzm7rus5l3h6zrphcal5a7ayfkhzm5oivjro2cp4/#/address/${token.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded border border-dex-blue text-sm text-dex-blue hover:bg-dex-blue hover:text-white transition-colors font-medium"
            >
              <FaExternalLinkAlt className="inline-block" /> View on Explorer
            </a>
            <a
              href={`https://app.pulsex.com/swap?outputCurrency=${token.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded border border-dex-blue text-sm text-dex-blue hover:bg-dex-blue hover:text-white transition-colors font-medium"
            >
              <FaExchangeAlt className="inline-block" /> View on PulseX
            </a>
          </div>

          {/* Social Links */}
          <div className="flex gap-2 flex-wrap">
            {socialLinks.web && (
              <a href={getSocialUrl('web', socialLinks.web)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded border border-dex-blue text-sm text-dex-blue hover:bg-dex-blue hover:text-white transition-colors font-medium">
                <FaGlobe className="inline-block" /> Website
              </a>
            )}
            {socialLinks.twitter && (
              <a href={getSocialUrl('twitter', socialLinks.twitter)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded border border-dex-blue text-sm text-dex-blue hover:bg-dex-blue hover:text-white transition-colors font-medium">
                <FaTwitter className="inline-block" /> Twitter
              </a>
            )}
            {socialLinks.telegram && (
              <a href={getSocialUrl('telegram', socialLinks.telegram)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded border border-dex-blue text-sm text-dex-blue hover:bg-dex-blue hover:text-white transition-colors font-medium">
                <FaTelegram className="inline-block" /> Telegram
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        {(token.description || token.projectInfo?.description) && (
          <div className="p-4 border-t border-dex-border bg-dex-bg-secondary text-dex-text-primary">
            <div className="font-semibold mb-1">Description</div>
            <div className="text-sm whitespace-pre-line">
              {token.description || token.projectInfo?.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenInfo;
