import React, { useState, useEffect } from 'react';
import './App.css';
import Registration from './components/Registration';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Departments from "./pages/dapartment";
import Development from "./pages/development";
import Marketing from "./pages/marketing";
import Seo from "./pages/seo";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if user is already logged in (using sessionStorage for current session)
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('isLoggedIn', 'true');
  };

  return (
    <div className="app-container container">
      <BrowserRouter>
        {isLoggedIn ? (
          <Routes>
            <Route path="/department" element={<Departments setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/development" element={<Development />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/seo" element={<Seo />} />
          </Routes>
        ) : (
          <Registration onLoginSuccess={handleLoginSuccess} />
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
