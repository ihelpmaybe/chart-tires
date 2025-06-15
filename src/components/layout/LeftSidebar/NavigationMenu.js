import React from "react";
import { useNavigate, NavLink } from "react-router-dom";

const NavigationMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-8">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">
        Navigation
      </h3>
      <nav className="space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm rounded transition-colors ${
              isActive
                ? "bg-dex-bg-highlight text-dex-text-primary"
                : "text-dex-text-secondary hover:bg-dex-bg-highlight hover:text-dex-text-primary"
            }`
          }
        >
          <span className="mr-3 w-5 text-center">🚀</span>
          Launched
        </NavLink>
        {/* <NavLink
          to="/pumptires"
          className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm rounded transition-colors ${
              isActive
                ? "bg-dex-bg-highlight text-dex-text-primary"
                : "text-dex-text-secondary hover:bg-dex-bg-highlight hover:text-dex-text-primary"
            }`
          }
        >
          <span className="mr-3 w-5 text-center">💰</span>
          All Tokens
        </NavLink> */}

      </nav>
    </div>
  );
};

export default NavigationMenu;
