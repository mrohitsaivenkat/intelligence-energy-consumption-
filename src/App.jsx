import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, role: userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">Verifying energy session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login${role ? `?role=${role}` : ''}`} replace />;
  }

  if (role && userRole && userRole !== role) {
    if (userRole === 'provider') return <Navigate to="/provider" replace />;
    if (userRole === 'household') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
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

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
