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
import './components/color.css';
import Header from "./components/header";

function App() {

  const [status, setStatus] = useState(null);

  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if user is already logged in (using sessionStorage for current session)
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  useEffect(() => {
    if (isLoggedIn) {
      const user = localStorage.getItem("user");
      if (user) {
        setStatus(JSON.parse(user));
      }
    } else {
      setStatus(null);
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    // Re-read user data from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      setStatus(JSON.parse(user));
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStatus(null); // Clear status state
    localStorage.removeItem("isLoggedIn"); // FIX: was sessionStorage, should be localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("Password");
    navigate("/");
  }

  return (
    <div className="app-container container pt-5">
      {isLoggedIn ? (
        <>
          <Header status={status} handleLogout={handleLogout} />
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
