import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getCategories } from '../api/categories';
import type { Category } from '../types';
import './CategoryPage.css';

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <div>
      <header className="page-header">
        <h2>학생복지시스템</h2>
        <button className="logout-btn" onClick={logout}>로그아웃</button>
      </header>

      <p className="cat-welcome">안녕하세요, <strong>{user?.name}</strong>님</p>

      <div className="cat-grid">
        {categories.map((cat) => (
          <button key={cat.id} className="cat-btn" onClick={() => navigate(`/items/${cat.id}`)}>
            {cat.title}
          </button>
        ))}
      </div>

      {categories.length === 0 && <p className="empty-text">카테고리가 아직 없습니다.</p>}
    </div>
  );
}
