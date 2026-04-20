import { useState, useEffect } from 'react';
import './App.css';
import Registration from './components/Registration';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, useNavigate } from "react-router-dom";
import Departments from "./components/Departments";
import DepartmentPages from "./pages/DevelopmentPages";
import TasksPage from "./pages/TasksPage";
import Footer from "./components/Footer"
import './components/color.css';
import Header from "./components/header";
import Drawer from "./components/Drawer";

function App() {
  const [status, setStatus] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const getSessionData = (key) => {
    const itemString = localStorage.getItem(key);
    if (!itemString) return null;

    let item;
    try {
      item = JSON.parse(itemString);
    } catch {
      localStorage.removeItem(key);
      return null;
    }

    if (!item?.expiry || Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  };
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!getSessionData('isLoggedIn');
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
    setSessionData('isLoggedIn', true, 24);
    setIsLoggedIn(true);

    console.log("user", user);
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

  useEffect(() => {
    const validSession = getSessionData('isLoggedIn');
    // console.log("validSession", validSession);
    if (!validSession && isLoggedIn) {
      handleLogout();
    }
  }, []);

  const setSessionData = (key, value, ttlHours = 24) => {
    const item = {
      value,
      expiry: Date.now() + ttlHours * 60 * 60 * 1000
    };
    localStorage.setItem(key, JSON.stringify(item));
  };


  return (
    <div className={`app-container container ${isDrawerOpen ? 'pt-3' : 'pt-5'}`}>
      {isLoggedIn ? (
        <>
          <Drawer status={status} handleLogout={handleLogout} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
          <Header isDrawerOpen={isDrawerOpen} status={status} toggleDrawer={() => setIsDrawerOpen(true)} />
          <main className={isDrawerOpen ? 'left__300' : ''}>
            <Routes>
              <Route path="/" element={<Departments setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/department/:name" element={<DepartmentPages />} />
            </Routes>
          </main>
          <Footer isDrawerOpen={isDrawerOpen} />
        </>
      ) : (
        <Registration onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
