import React, { useState, useEffect } from 'react';
import './App.css';
import Registration from './components/Registration';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, useNavigate } from "react-router-dom";
import Departments from "./components/Departments";
import Development from "./pages/development";
import Marketing from "./pages/marketing";
import Seo from "./pages/seo";
import Footer from "./components/Footer"
import Header from "./components/header";

function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if user is already logged in (using sessionStorage for current session)
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("Password");
    navigate("/");
  }

  return (
    <div className="app-container container pt-5">
      {isLoggedIn ? (
        <>
          <Header handleLogout={handleLogout} />
          <main>
            <Routes>
              <Route path="/" element={<Departments setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/development" element={<Development />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/seo" element={<Seo />} />
            </Routes>
          </main>
          <Footer />
        </>
      ) : (
        <Registration onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
