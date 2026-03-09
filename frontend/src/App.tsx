import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';

import LoginPage from './pages/LoginPage';
import CategoryPage from './pages/CategoryPage';
import ItemListPage from './pages/ItemListPage';
import RentalPage from './pages/RentalPage';
import MyRentalPage from './pages/MyRentalPage';
import AdminItemPage from './pages/AdminItemPage';
import AdminCategoryPage from './pages/AdminCategoryPage';

function AppRoutes() {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) return <div className="loading">로드 중...</div>;

  if (!user) return <LoginPage />;

  const isAdmin = user.permission === 1;

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<CategoryPage />} />
        <Route path="/items/:categoryId" element={<ItemListPage />} />
        <Route path="/rental" element={<RentalPage />} />
        <Route path="/my-rentals" element={<MyRentalPage />} />
        <Route path="/admin/items" element={isAdmin ? <AdminItemPage /> : <Navigate to="/" />} />
        <Route path="/admin/categories" element={isAdmin ? <AdminCategoryPage /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Navbar />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
