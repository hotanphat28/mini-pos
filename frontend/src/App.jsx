import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import POS from './components/POS';
import Admin from './components/Admin';

const API_URL = `http://${window.location.hostname}:3001/api`;

function App() {
  const [user, setUser] = useState(null);
  const [features, setFeatures] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('pos_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const res = await axios.get(`${API_URL}/features`);
      setFeatures(res.data);
    } catch (err) {
      console.error('Lỗi lấy tính năng:', err);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('pos_user', JSON.stringify(userData));
    navigate('/pos');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/pos" : "/login"} />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/pos" element={user ? <POS user={user} features={features} onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/admin" element={user && user.role === 'admin' ? <Admin user={user} features={features} onLogout={handleLogout} /> : <Navigate to="/pos" />} />
    </Routes>
  );
}

export default App;
