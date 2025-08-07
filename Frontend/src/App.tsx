import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout and common pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Goals from './pages/Goals';
import Growth from './pages/Growth';
import Profile from './pages/Profile';
import SignupCompany from './pages/SignupCompany';
import Login from './pages/Login';

// Admin-only pages
import User from './pages/admin/User';
import Company from './pages/admin/Company';

// Auth context
import { AuthProvider, useAuth } from './pages/context/Auth';

function AppRoutes() {
  const { authData } = useAuth();
  const role = authData.role;

  return (
    <Layout>
      <Routes>
        {/* Common routes for all authenticated users */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup-company" element={<SignupCompany />} />
        <Route path="/login" element={<Login />} />

        {/* Admin-only routes */}
        {role === 'admin' && (
          <>
            <Route path="/Frontend/src/pages/admin/User.tsx" element={<User />} />
            <Route path="/Frontend/src/pages/admin/Company.tsx" element={<Company />} />
          </>
        )}
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <AppRoutes />

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                borderRadius: '0.75rem',
                padding: '12px 16px',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
