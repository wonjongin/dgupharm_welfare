import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuthStore } from '../store/authStore';
import { getItems, createItem, updateItem, deleteItem } from '../api/items';
import { getCategories } from '../api/categories';
// TODO: v2.0에서 QR 기능 활성화
// import { QRCodeSVG } from 'qrcode.react';
import type { Item, Category, ItemCreate, ItemUpdate } from '../types';
import AdminTabs from '../components/AdminTabs';
import './AdminPage.css';

interface FormData {
  name: string;
  eid: string;
  category_id: string;
  status: string;
}

const INIT_FORM: FormData = { name: '', eid: '', category_id: '', status: '정상' };

export default function AdminItemPage() {
  const token = useAuthStore((state) => state.token);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(INIT_FORM);
  // TODO: v2.0에서 QR 기능 활성화
  // const [qrItem, setQrItem] = useState<Item | null>(null);

  const fetchAll = async () => {
    const [i, c] = await Promise.all([getItems(), getCategories()]);
    setItems(i);
    setCategories(c);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const payload: ItemCreate | ItemUpdate = {
      name: form.name,
      eid: form.eid,  // 문자열 그대로 사용
      category_id: Number(form.category_id),
      status: form.status,
    };
    try {
      if (editId !== null) {
        await updateItem(editId, payload, token);
      } else {
        await createItem(payload as ItemCreate, token);
      }
      await fetchAll();
      closeForm();
    } catch (err: any) {
      alert(err.response?.data?.detail || '오류 발생');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('이 물품을 삭제하겠습니까?')) return;
    if (!token) return;
    try {
      await deleteItem(id, token);
      await fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.detail || '오류 발생');
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm(INIT_FORM);
    setShowForm(true);
  };

  const openEdit = (item: Item) => {
    setEditId(item.id);
    setForm({ name: item.name, eid: item.eid, category_id: String(item.category.id), status: item.status });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
  };

  const set = (key: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div>
      <header className="page-header">
        <h2>물품 관리</h2>
        <button className="admin-add-btn" onClick={openAdd}>+ 추가</button>
      </header>

      <AdminTabs />

      {showForm && (
        <div className="admin-form-card">
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="물품 이름" value={form.name} onChange={set('name')} required />
            <input type="text" placeholder="물품 번호(eid)" value={form.eid} onChange={set('eid')} required />
            <select value={form.category_id} onChange={set('category_id')} required>
              <option value="">카테고리 선택</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <select value={form.status} onChange={set('status')}>
              <option value="정상">정상</option>
              <option value="폐기">폐기</option>
              <option value="분실">분실</option>
            </select>
            <div className="admin-form-btns">
              <button type="submit" className="admin-save-btn">{editId !== null ? '수정' : '추가'}</button>
              <button type="button" className="admin-cancel-btn" onClick={closeForm}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* TODO: v2.0에서 QR 기능 활성화 */}
      {/* {qrItem && (
        <div className="qr-modal-bg" onClick={() => setQrItem(null)}>
          <div className="qr-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{qrItem.name}</h3>
            <QRCodeSVG value={qrItem.uuid} size={200} />
            <p className="qr-uuid">{qrItem.uuid}</p>
            <button className="qr-close-btn" onClick={() => setQrItem(null)}>닫기</button>
          </div>
        </div>
      )} */}

      <div className="admin-list">
        {items.map((item) => (
          <div key={item.id} className="admin-item-card">
            <div className="admin-item-info">
              <h3>{item.name}</h3>
              <p>번호: {item.eid} &middot; {item.category.title}</p>
              <p className={`admin-status ${item.status}`}>{item.status}</p>
            </div>
            <div className="admin-item-actions">
              {/* TODO: v2.0에서 QR 기능 활성화 */}
              {/* <button className="btn-qr" onClick={() => setQrItem(item)}>QR</button> */}
              <button className="btn-edit" onClick={() => openEdit(item)}>수정</button>
              <button className="btn-delete" onClick={() => handleDelete(item.id)}>삭제</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="empty-text">물품이 없습니다.</p>}
      </div>
    </div>
  );
}
