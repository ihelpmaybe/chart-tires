import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faXTwitter, faInstagram, faBluesky } from '@fortawesome/free-brands-svg-icons';

const SocialShareButtons = ({ url, name, symbol }) => {
  const message = `🚀 Check out ${name} (${symbol}) from PUMP.tires! ${url}`;
  return (
    <div className="flex justify-end mb-4 space-x-2">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
      >
        <FontAwesomeIcon icon={faFacebookF} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 rounded bg-blue-400 text-white hover:bg-blue-500 flex items-center gap-2"
      >
        <FontAwesomeIcon icon={faXTwitter} />
      </a>
      <a
        href={`https://bsky.app/intent/compose?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 rounded bg-blue-300 text-white hover:bg-blue-400 flex items-center gap-2"
      >
        <FontAwesomeIcon icon={faBluesky} />
      </a>
      <a
        href={`https://www.instagram.com/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 rounded bg-pink-500 text-white hover:bg-pink-600 flex items-center gap-2"
      >
        <FontAwesomeIcon icon={faInstagram} />
      </a>
      <a
        href={`https://truthsocial.com/compose?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
      >
        {/* Simple Truth Social icon or fallback text */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="16" rx="4" fill="white"/><text x="8" y="12" textAnchor="middle" fontSize="10" fill="#d32f2f" fontWeight="bold">T</text></svg>
      </a>
    </div>
  );
};

export default SocialShareButtons; 