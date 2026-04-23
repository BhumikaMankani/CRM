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

function App() {
  const [allDepartments, setAllDepartments] = useState([]);
  const [status, setStatus] = useState(null);
  const [savedFilters, setSavedFilters] = useState([]);
  const [locationPathName, setLocationPathName] = useState("/");
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isFiltersLoading, setIsFiltersLoading] = useState(true);

  const normalizeDepartmentValue = (dept) => {
    return dept
      ? dept.toString().trim().toLowerCase().replace(/\s+/g, "_")
      : "development";
  };

  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    return normalizeDepartmentValue(localStorage.getItem("selectedDepartment") || "development");
  });

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

  const normalizedDepartment = normalizeDepartmentValue(selectedDepartment);
  const savedFiltersCacheKey = status?._id ? `savedFilters_${status._id}_${normalizedDepartment}` : null;

  const getCachedValue = (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === "null") return fallback;
      const parsed = JSON.parse(raw);
      return parsed === null ? fallback : parsed;
    } catch (err) {
      console.warn("Failed to read cache:", key, err);
      return fallback;
    }
  };

  const setCachedValue = (key, value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
        return;
      }
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn("Failed to save cache:", key, err);
    }
  };

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

  // useEffect(() => {
  //   if (!savedFiltersCacheKey) return;

  //   const cachedFilters = getCachedValue(savedFiltersCacheKey, null);

  //   if (cachedFilters !== null) {
  //     setSavedFilters(cachedFilters);
  //   }
  // }, [savedFiltersCacheKey]);


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

  // console.log("savedFiltersCacheKey", savedFiltersCacheKey);
  // console.log("savedFilters", savedFilters);

//   const fetchSavedFilters = useCallback(async () => {
//   if (!status?._id) return;

//   setIsFiltersLoading(true); // 🔥 START LOADING

//   try {
//     const url = `${API_URL}/api/filters?userId=${status._id}&department=${selectedDepartment}`;
//     const response = await fetch(url);

//     if (!response.ok) throw new Error('Failed to fetch filters');

//     const data = await response.json();
//     const normalizedData = Array.isArray(data) ? data : [];

//     setSavedFilters(normalizedData);

//     if (savedFiltersCacheKey) {
//       setCachedValue(savedFiltersCacheKey, normalizedData);
//     }

//   } catch (err) {
//     console.error('Failed to load saved filters:', err);
//   } finally {
//     setIsFiltersLoading(false); // 🔥 DONE LOADING
//   }
// }, [status?._id, selectedDepartment, savedFiltersCacheKey]);

// useEffect(() => {
//   if (!status?._id) return;

//   fetchSavedFilters();
// }, [status?._id, selectedDepartment]);

  const fetchDepartments = async () => {
    const response = await fetch(`${API_URL}/api/department`);
    const data = await response.json();
    setAllDepartments(data);
  }
  useEffect(() => {
    fetchDepartments();
  }, []);

  const setSessionData = (key, value, ttlHours = 24) => {
    const item = {
      value,
      expiry: Date.now() + ttlHours * 60 * 60 * 1000
    };
    localStorage.setItem(key, JSON.stringify(item));
  };
  const location = useLocation();


  return (
    <div className={`app-container container ${location.pathname === '/' ? (isDrawerOpen ? 'pt-0 pl-0 container_1600' : 'pt-5') : ''}`}>
      {isLoggedIn ? (
        <>
          {location.pathname === '/' && (
            <Drawer selectedDepartment={selectedDepartment} currentUser={status} allDepartments={allDepartments} fetchDepartments={fetchDepartments} status={status} handleLogout={handleLogout} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
          )}
          <Header location={location.pathname} currentUser={status} allDepartments={allDepartments} fetchDepartments={fetchDepartments} handleDepartmentChange={handleDepartmentChange} selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} isDrawerOpen={isDrawerOpen} status={status} toggleDrawer={() => setIsDrawerOpen(true)} />
          <main className={location.pathname === '/' ? (isDrawerOpen ? 'left__300' : '') : ''}>
            <Routes>
              <Route path="/" element={<Departments isFiltersLoading={isFiltersLoading} setLocationPathName={setLocationPathName} locationPathName={locationPathName} allDepartments={allDepartments} fetchDepartments={fetchDepartments} selectedDepartment={selectedDepartment} setIsLoggedIn={setIsLoggedIn} />} />
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
