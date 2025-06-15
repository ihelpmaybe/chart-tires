import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import TokenPage from "./pages/TokenPage";
import SearchModal from "./components/modals/SearchModal";
// import PumpTiresPage from "./pages/PumpTiresPage";
import GraduatedPage from "./pages/GraduatedPage";

const App = () => {
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen">
        <MainLayout openSearchModal={() => setSearchModalOpen(true)}>
          <Routes>            
            
            <Route path="/" element={<GraduatedPage />} />
            <Route path="/a-pump-screener" element={<GraduatedPage />} />
            {/* <Route path="/pumptires" element={<PumpTiresPage />} /> */}
            
            {/* Token routes */}
            <Route path="/token/:baseTokenAddress" element={<TokenPage />} />
            <Route path="/token/:baseTokenAddress/:quoteToken" element={<TokenPage />} />

          </Routes>
        </MainLayout>

        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setSearchModalOpen(false)}
        />
      </div>
    </Router>
  );
};

export default App;
