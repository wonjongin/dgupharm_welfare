import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getAllRentals } from '../api/rentals';
import { getItems } from '../api/items';
import AdminTabs from '../components/AdminTabs';
import { todayStr, daysBetween, getRentalState, datePart, formatDateTime } from '../utils/rentalStatus';
import type { Rental, Item } from '../types';
import './AdminPage.css';

interface Activity {
  key: string;
  type: 'rent' | 'return';
  date: string;
  rental: Rental;
}

export default function AdminDashboardPage() {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    Promise.all([getAllRentals(token), getItems()])
      .then(([r, i]) => { setRentals(r); setItems(i); })
      .catch((err) => setError(err.response?.data?.detail || '데이터를 불러오지 못했습니다'))
      .finally(() => setLoading(false));
  }, [token]);

  const today = todayStr();

  const stats = useMemo(() => {
    const active = rentals.filter((r) => !r.is_returned);
    const overdue = active
      .filter((r) => getRentalState(r, today) === 'overdue')
      .sort((a, b) => a.rental_end.localeCompare(b.rental_end));
    const rentedItemIds = new Set(active.map((r) => r.item.id));

    // 카테고리별 물품 현황
    const byCategory = new Map<string, { total: number; rented: number }>();
    items.forEach((item) => {
      const c = byCategory.get(item.category.title) || { total: 0, rented: 0 };
      c.total += 1;
      if (rentedItemIds.has(item.id)) c.rented += 1;
      byCategory.set(item.category.title, c);
    });

    // 최근 활동: 대여·반납 이벤트를 날짜 내림차순으로
    const activities: Activity[] = [];
    rentals.forEach((r) => {
      activities.push({ key: `rent-${r.id}`, type: 'rent', date: r.rental_start, rental: r });
      if (r.is_returned && r.return_date) {
        activities.push({ key: `return-${r.id}`, type: 'return', date: r.return_date, rental: r });
      }
    });
    activities.sort((a, b) => b.date.localeCompare(a.date) || b.rental.id - a.rental.id);

    return {
      activeCount: active.length,
      overdue,
      todayRent: rentals.filter((r) => datePart(r.rental_start) === today).length,
      todayReturn: rentals.filter((r) => r.return_date && datePart(r.return_date) === today).length,
      totalItems: items.length,
      available: items.filter((i) => i.status === '정상' && !rentedItemIds.has(i.id)).length,
      unusable: items.filter((i) => i.status !== '정상').length,
      byCategory: [...byCategory.entries()],
      recent: activities.slice(0, 10),
    };
  }, [rentals, items, today]);

  const goRentals = (filter: string) => navigate(`/admin/rentals?filter=${filter}`);

  return (
    <div>
      <header className="page-header">
        <h2>대시보드</h2>
        <span className="dash-today">{today}</span>
      </header>

      <AdminTabs />

      {loading && <div className="loading">로드 중...</div>}
      {error && <p className="empty-text">{error}</p>}

      {!loading && !error && (
        <div className="dash-body">
          <div className="dash-stats">
            <button className="dash-stat" onClick={() => goRentals('active')}>
              <span className="dash-stat-value">{stats.activeCount}</span>
              <span className="dash-stat-label">대여 중</span>
            </button>
            <button className={`dash-stat ${stats.overdue.length > 0 ? 'danger' : ''}`} onClick={() => goRentals('overdue')}>
              <span className="dash-stat-value">{stats.overdue.length}</span>
              <span className="dash-stat-label">연체</span>
            </button>
            <button className="dash-stat" onClick={() => goRentals('all')}>
              <span className="dash-stat-value">{stats.todayRent}</span>
              <span className="dash-stat-label">오늘 대여</span>
            </button>
            <button className="dash-stat" onClick={() => goRentals('returned')}>
              <span className="dash-stat-value">{stats.todayReturn}</span>
              <span className="dash-stat-label">오늘 반납</span>
            </button>
          </div>

          <section className="dash-section">
            <h3 className="dash-section-title">물품 현황</h3>
            <div className="dash-item-summary">
              <span>전체 <strong>{stats.totalItems}</strong></span>
              <span>대여 가능 <strong className="ok">{stats.available}</strong></span>
              <span>대여 중 <strong className="warn">{stats.activeCount}</strong></span>
              <span>폐기·분실 <strong className="bad">{stats.unusable}</strong></span>
            </div>
            {stats.byCategory.map(([title, c]) => (
              <div key={title} className="dash-cat-row">
                <span className="dash-cat-name">{title}</span>
                <div className="dash-bar">
                  <div className="dash-bar-fill" style={{ width: `${c.total ? (c.rented / c.total) * 100 : 0}%` }} />
                </div>
                <span className="dash-cat-count">{c.rented}/{c.total}</span>
              </div>
            ))}
          </section>

          <section className="dash-section">
            <h3 className="dash-section-title">
              연체 목록
              {stats.overdue.length > 0 && <span className="dash-badge danger">{stats.overdue.length}</span>}
            </h3>
            {stats.overdue.length === 0 && <p className="dash-empty">연체된 물품이 없습니다.</p>}
            {stats.overdue.map((r) => (
              <div key={r.id} className="dash-row">
                <div>
                  <p className="dash-row-main">{r.borrower.name} <span className="dash-sid">{r.borrower.sid}</span></p>
                  <p className="dash-row-sub">{r.item.name} · {r.item.eid} · 기한 {r.rental_end}</p>
                </div>
                <span className="dash-badge danger">{daysBetween(r.rental_end, today)}일</span>
              </div>
            ))}
          </section>

          <section className="dash-section">
            <h3 className="dash-section-title">최근 활동</h3>
            {stats.recent.length === 0 && <p className="dash-empty">아직 활동이 없습니다.</p>}
            {stats.recent.map((a) => (
              <div key={a.key} className="dash-row">
                <div>
                  <p className="dash-row-main">{a.rental.borrower.name} <span className="dash-sid">{a.rental.borrower.sid}</span></p>
                  <p className="dash-row-sub">{a.rental.item.name} · {a.rental.item.eid} · {formatDateTime(a.date)}</p>
                </div>
                <span className={`dash-badge ${a.type === 'rent' ? 'rent' : 'ok'}`}>
                  {a.type === 'rent' ? '대여' : '반납'}
                </span>
              </div>
            ))}
            {rentals.length > 0 && (
              <button className="dash-more-btn" onClick={() => goRentals('all')}>전체 대여내역 보기</button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
