import { useState, useEffect, FormEvent } from 'react';
import { useAuthStore } from '../store/authStore';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';
import type { Category } from '../types';
import AdminTabs from '../components/AdminTabs';
import './AdminPage.css';

export default function AdminCategoryPage() {
  const token = useAuthStore((state) => state.token);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState('');

  const fetchAll = () => getCategories().then(setCategories).catch(() => {});

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      if (editId !== null) {
        await updateCategory(editId, title, token);
      } else {
        await createCategory(title, token);
      }
      await fetchAll();
      closeForm();
    } catch (err: any) {
      alert(err.response?.data?.detail || '오류 발생');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('이 카테고리를 삭제하겠습니까?')) return;
    if (!token) return;
    try {
      await deleteCategory(id, token);
      await fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.detail || '오류 발생');
    }
  };

  const openAdd = () => { setEditId(null); setTitle(''); setShowForm(true); };

  const openEdit = (cat: Category) => { setEditId(cat.id); setTitle(cat.title); setShowForm(true); };

  const closeForm = () => { setShowForm(false); setEditId(null); setTitle(''); };

  return (
    <div>
      <header className="page-header">
        <h2>카테고리 관리</h2>
        <button className="admin-add-btn" onClick={openAdd}>+ 추가</button>
      </header>

      <AdminTabs />

      {showForm && (
        <div className="admin-form-card">
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="카테고리 이름" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <div className="admin-form-btns">
              <button type="submit" className="admin-save-btn">{editId !== null ? '수정' : '추가'}</button>
              <button type="button" className="admin-cancel-btn" onClick={closeForm}>취소</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-list">
        {categories.map((cat) => (
          <div key={cat.id} className="admin-cat-card">
            <h3>{cat.title}</h3>
            <div className="admin-item-actions">
              <button className="btn-edit" onClick={() => openEdit(cat)}>수정</button>
              <button className="btn-delete" onClick={() => handleDelete(cat.id)}>삭제</button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="empty-text">카테고리가 없습니다.</p>}
      </div>
    </div>
  );
}
