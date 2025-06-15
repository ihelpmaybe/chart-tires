import React from "react";

const TokenTabs = ({ activeTab, onChange }) => {
  const tabs = [
    { id: "transactions", label: "Transactions" },
    { id: "holders", label: "Holders" },
    { id: "holder-insights", label: "Holder Insights" },
    { id: "snipers", label: "Snipers" }
  ];

  return (
    <div className="flex border-b border-dex-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === tab.id
              ? "text-dex-blue border-b-2 border-dex-blue"
              : "text-dex-text-secondary hover:text-dex-text-primary"
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TokenTabs;
