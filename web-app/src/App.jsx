import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages
import Dashboard from './pages/Dashboard';
import TimeEntry from "./pages/TimeEntry";
import UploadProof from "./pages/UploadProof";
import Approvals from "./pages/Approvals";
import ManageTeams from "./pages/ManageTeams";
import Subscription from "./pages/Subscription";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Wrapped individually for safety */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/time-entry" 
            element={
              <ProtectedRoute>
                <TimeEntry />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload-proof" 
            element={
              <ProtectedRoute>
                <UploadProof />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/approvals" 
            element={
              <ProtectedRoute>
                <Approvals />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-teams" 
            element={
              <ProtectedRoute>
                <ManageTeams />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subscription" 
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            } 
          />

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;