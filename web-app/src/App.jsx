import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

// Public Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import TimeEntry from "./pages/TimeEntry";
import UploadProof from "./pages/UploadProof";
import Approvals from "./pages/Approvals";
import ManageTeams from "./pages/ManageTeams";
import Subscription from "./pages/Subscription";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminPayroll from "./pages/AdminPayroll";
import AdminPayrollAdjustment from "./pages/AdminPayrollAdjustment";

/**
 * App.jsx
 * -----------------------
 * This is the main entry point of the TimeSync React application. It sets up the routing structure 
 * using React Router and defines both public and protected routes. The AuthProvider is used to manage 
 * authentication state across the application, while the ProtectedRoute component ensures that certain 
 * routes are only accessible to authenticated users with the appropriate roles. The MainLayout component 
 * provides a consistent layout for all protected pages, while public pages like Login and Register are 
 * accessible without authentication. The routing structure also includes default redirects to guide 
 * users to the appropriate pages based on their authentication status.
 */

function App() {
return ( <BrowserRouter> <AuthProvider> <Routes>

```
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Layout Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/time-entry" element={<TimeEntry />} />
        <Route path="/upload-proof" element={<UploadProof />} />
        <Route path="/approvals" element={<Approvals />} />       
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/admin-analytics" element={<AdminAnalytics />} />

         <Route
          path="/manage-teams"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ManageTeams />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payroll"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPayroll />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payroll/:id/adjust"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPayrollAdjustment />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Default Redirects */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />

    </Routes>
  </AuthProvider>
</BrowserRouter>


);
}

export default App;
