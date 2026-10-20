import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicDashboard from './pages/PublicDashboard';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* / → Halaman publik (dashboard produk yang sudah ada) */}
        <Route path="/" element={<PublicDashboard />} />

        {/* /login → Halaman login */}
        <Route path="/login" element={<LoginPage />} />

        {/* /admin → Halaman admin (dilindungi ProtectedRoute) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback redirect ke beranda */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
