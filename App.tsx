import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ManagerDashboard from './pages/ManagerDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EquipmentList from './pages/EquipmentList';
import TeamManagement from './pages/TeamManagement';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('currentUser', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
        
        <Route element={<Layout user={user} onLogout={handleLogout} />}>
          <Route path="/" element={<Navigate to={user ? "/login" : "/login"} replace />} />
          
          <Route 
            path="/dashboard" 
            element={user?.role === UserRole.Manager ? <ManagerDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/technician-dashboard" 
            element={user?.role === UserRole.Technician ? <TechnicianDashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/employee-dashboard" 
            element={user?.role === UserRole.Employee ? <EmployeeDashboard user={user} /> : <Navigate to="/login" />} 
          />

          <Route path="/equipment" element={user ? <EquipmentList initialMode="inventory" /> : <Navigate to="/login" />} />
          <Route path="/teams" element={user?.role === UserRole.Manager ? <TeamManagement /> : <Navigate to="/login" />} />
          
          <Route path="/work-centers" element={user ? <EquipmentList initialMode="work-centers" /> : <Navigate to="/login" />} />
          
          <Route path="/calendar" element={user?.role === UserRole.Technician ? <TechnicianDashboard user={user} initialTab="calendar" /> : <Navigate to="/login" />} />

        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;