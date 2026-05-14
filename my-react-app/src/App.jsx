import { useState, useEffect, useCallback } from 'react';
import './App.css';
import Registration from './components/Registration';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route, useNavigate } from "react-router-dom";
import Departments from "./components/Departments";
import { API_URL } from '/proxy'
import DepartmentPages from "./pages/DevelopmentPages";
import TasksPage from "./pages/TasksPage";
import Footer from "./components/Footer"
import './components/color.css';
import Header from "./components/header";
import Drawer from "./components/Drawer";
import { Link, useLocation } from 'react-router-dom';
import ResetPopup from './components/ResetPopup';

function App() {
  const [allDepartments, setAllDepartments] = useState([]);
  const [cronStatus, setCronStatus] = useState(null);

  const [status, setStatus] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [locationPathName, setLocationPathName] = useState("/");

  const normalizeDepartmentValue = (dept) => {
    return dept
      ? dept.toString().trim().toLowerCase().replace(/\s+/g, "_")
      : "development";
  };

  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    return normalizeDepartmentValue(localStorage.getItem("selectedDepartment") || "development");
  });

  useEffect(() => {
    fetch(`${API_URL}/api/cronStatus`)
      .then((res) => res.json())
      .then((data) => setCronStatus(data.lastRunDate));
  }, []);



  const today = new Date().toISOString().split("T")[0];

  console.log("cronStatus", cronStatus);
  console.log("today", today);
  useEffect(() => {
    const normalized = normalizeDepartmentValue(selectedDepartment);
    localStorage.setItem("selectedDepartment", normalized);
  }, [selectedDepartment]);

  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(normalizeDepartmentValue(dept));
  };
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


  const handleLoginSuccess = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const initialDepartment = normalizeDepartmentValue(user?.department?.[0] || selectedDepartment);

    setSessionData('isLoggedIn', true, 24);
    setSelectedDepartment(initialDepartment);
    setIsLoggedIn(true);
    setStatus(user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStatus(null);

    localStorage.clear(); // removes ALL keys

    navigate("/");
  };

  useEffect(() => {
    const validSession = getSessionData('isLoggedIn');
    if (!validSession && isLoggedIn) {
      handleLogout();
    }
  }, []);

  const fetchDepartments = async () => {
    const response = await fetch(`${API_URL}/api/department`);
    const data = await response.json();
    setAllDepartments(data);
  }
  useEffect(() => {
    fetchDepartments();
  }, []);

  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    if (!isHome) setIsDrawerOpen(false);
  }, [isHome]);

  // console.log("isHome", isHome);

  const setSessionData = (key, value, ttlHours = 24) => {
    const item = {
      value,
      expiry: Date.now() + ttlHours * 60 * 60 * 1000
    };
    localStorage.setItem(key, JSON.stringify(item));
  };

  return (
    <div className={`app-container container ${isHome ? 'pt-0 pl-0 container_1600' : 'pt-5'}`}>
      {cronStatus && cronStatus !== today && (
        <ResetPopup status={status} allDepartments={allDepartments} />
      )}
      {isLoggedIn ? (
        <>
          {isHome && (
            <Drawer selectedDepartment={selectedDepartment} allDepartments={allDepartments} fetchDepartments={fetchDepartments} status={status} handleLogout={handleLogout} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
          )}
          <Header currentUser={status} isHome={isHome} handleLogout={handleLogout} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} allDepartments={allDepartments} fetchDepartments={fetchDepartments} handleDepartmentChange={handleDepartmentChange} selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} status={status} toggleDrawer={() => setIsDrawerOpen(true)} />
          <main className={isHome ? 'left__300' : ''}>
            <Routes>
              <Route path="/" element={<Departments setLocationPathName={setLocationPathName} locationPathName={locationPathName} allDepartments={allDepartments} fetchDepartments={fetchDepartments} selectedDepartment={selectedDepartment} setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/department/:name" element={<DepartmentPages />} />
            </Routes>
          </main>
          <Footer location={location.pathname} isDrawerOpen={isDrawerOpen} />
        </>
      ) : (
        <Registration selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
