import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Habits from './pages/Habits';
import Journal from './pages/Journal';
import AIChat from './components/AIChat';
import './App.scss';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="app-container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <div className="d-flex w-100">
                    <Sidebar />
                    <div className="main-content">
                      <AIChat /> {/* Global AI Chat Widget */}
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/schedule" element={<Schedule />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/search" element={<div className="p-4">Search (Coming Soon)</div>} /> {/* Placeholder */}
                        <Route path="/habits" element={<Habits />} />
                        <Route path="/journal" element={<Journal />} />
                        {/* Placeholder for future routes */}
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
