import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getAllRentals } from '../api/rentals';
import AdminTabs from '../components/AdminTabs';
import { todayStr, daysBetween, getRentalState, formatDateTime, STATE_LABEL } from '../utils/rentalStatus';
import type { Rental } from '../types';
import './AdminPage.css';

type Filter = 'all' | 'active' | 'overdue' | 'returned';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '대여 중' },
  { key: 'overdue', label: '연체' },
  { key: 'returned', label: '반납 완료' },
];

export default function AdminRentalPage() {
  const token = useAuthStore((state) => state.token);
  const [searchParams, setSearchParams] = useSearchParams();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const filterParam = searchParams.get('filter') as Filter | null;
  const filter: Filter = FILTERS.some((f) => f.key === filterParam) ? filterParam! : 'all';
  const setFilter = (f: Filter) => setSearchParams({ filter: f }, { replace: true });

  useEffect(() => {
    if (!token) return;
    getAllRentals(token)
      .then(setRentals)
      .catch((err) => setError(err.response?.data?.detail || '대여내역을 불러오지 못했습니다'))
      .finally(() => setLoading(false));
  }, [token]);

  const today = todayStr();

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: rentals.length, active: 0, overdue: 0, returned: 0 };
    rentals.forEach((r) => {
      const s = getRentalState(r, today);
      if (s === 'active' || s === 'overdue') c.active += 1;
      if (s === 'overdue') c.overdue += 1;
      if (r.is_returned) c.returned += 1;
    });
    return c;
  }, [rentals, today]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rentals.filter((r) => {
      const s = getRentalState(r, today);
      if (filter === 'active' && r.is_returned) return false;
      if (filter === 'overdue' && s !== 'overdue') return false;
      if (filter === 'returned' && !r.is_returned) return false;
      if (!q) return true;
      return [r.borrower.name, r.borrower.sid, r.item.name, r.item.eid, r.item.category.title]
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [rentals, filter, query, today]);

  return (
    <div>
      <header className="page-header">
        <h2>대여내역</h2>
      </header>

      <AdminTabs />

      <div className="rh-controls">
        <input
          type="search"
          className="rh-search"
          placeholder="이름, 학번, 물품명, 물품번호 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="rh-chips">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`rh-chip ${filter === f.key ? 'active' : ''} ${f.key === 'overdue' && counts.overdue > 0 ? 'danger' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}{!loading && ` ${counts[f.key]}`}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="loading">로드 중...</div>}
      {error && <p className="empty-text">{error}</p>}

      {!loading && !error && (
        <div className="admin-list">
          {filtered.map((r) => {
            const s = getRentalState(r, today);
            return (
              <div key={r.id} className={`rh-card ${s}`}>
                <div className="rh-card-header">
                  <div>
                    <h3>{r.item.name}</h3>
                    <p className="rh-item-meta">{r.item.category.title} · {r.item.eid}</p>
                  </div>
                  <span className={`rh-status ${s}`}>
                    {STATE_LABEL[s]}
                    {s === 'overdue' && ` ${daysBetween(r.rental_end, today)}일`}
                  </span>
                </div>
                <p className="rh-borrower">{r.borrower.name} <span className="dash-sid">{r.borrower.sid}</span></p>
                <div className="rh-dates">
                  <div><span>대여</span>{formatDateTime(r.rental_start)}</div>
                  <div><span>반납기한</span>{r.rental_end}</div>
                  <div><span>반납</span>{formatDateTime(r.return_date)}</div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="empty-text">해당하는 대여내역이 없습니다.</p>}
        </div>
      )}
    </div>
  );
}
