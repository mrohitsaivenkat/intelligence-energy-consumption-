import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  const isAuthenticated = () => !!localStorage.getItem('token');
  const getUserRole = () => localStorage.getItem('role');

  const ProtectedRoute = ({ children, role }) => {
    if (!isAuthenticated()) return <Navigate to="/login" />;
    const userRole = getUserRole();
    if (role && userRole !== role) return <Navigate to="/" />;
    return children;
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute role="household">
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/provider/*" 
            element={
              <ProtectedRoute role="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

