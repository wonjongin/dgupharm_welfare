import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { getItemsByCategory } from '../api/items';
import type { ItemWithStatus } from '../types';
import './ItemListPage.css';

function statusClass(item: ItemWithStatus): string {
  if (item.status !== '정상') return 'unavailable';
  return item.is_rented ? 'rented' : 'available';
}

function statusLabel(item: ItemWithStatus): string {
  if (item.status !== '정상') return item.status;
  return item.is_rented ? '대여 중' : '대여 가능';
}

export default function ItemListPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [items, setItems] = useState<ItemWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!categoryId) return;
    getItemsByCategory(Number(categoryId))
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId]);

  if (loading) return <div className="loading">로드 중...</div>;

  const catTitle = items.length > 0 ? items[0].category.title : '물품 목록';

  return (
    <div>
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <IoArrowBack size={20} /> 뒤로
        </button>
        <h2>{catTitle}</h2>
        <div style={{ width: 48 }} />
      </header>

      <div className="item-list">
        {items.map((item) => {
          const cls = statusClass(item);
          const isClickable = item.status === '정상' && !item.is_rented;

          const handleClick = () => {
            if (isClickable) {
              navigate('/rental', { state: { item, mode: 'rent' } });
            }
          };

          return (
            <div
              key={item.id}
              className={`item-card ${cls} ${isClickable ? 'clickable' : ''}`}
              onClick={handleClick}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
            >
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-eid">물품번호: {item.eid}</p>
                <p className="item-uuid">고유번호: {item.uuid}</p>
              </div>
              <span className={`status-badge ${cls}`}>{statusLabel(item)}</span>
            </div>
          );
        })}
        {items.length === 0 && <p className="empty-text">해당 카테고리의 물품이 없습니다.</p>}
      </div>
    </div>
  );
}
