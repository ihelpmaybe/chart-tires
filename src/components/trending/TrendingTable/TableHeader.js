import React from "react";

const TableHeader = ({ sortBy, sortDirection, onSortChange }) => {
  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;

    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <thead>
      <tr className="neon-header neon-border text-xs uppercase">
        <th className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-left">#</th>
        <th className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-left">NAME</th>
        <th className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right">PRICE</th>
        <th className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right">PRICE CHANGE</th>
        <th className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right">VOLUME 24H</th>
        <th className="sticky top-0 bg-dex-bg-primary px-4 py-3 text-right">LIQUIDITY</th>
      </tr>
    </thead>
  );
};

export default TableHeader;
