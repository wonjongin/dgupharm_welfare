import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getMyRentals, returnRental } from '../api/rentals';
import { formatDateTime } from '../utils/rentalStatus';
import type { Rental } from '../types';
import './MyRentalPage.css';

export default function MyRentalPage() {
  const token = useAuthStore((state) => state.token);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [returning, setReturning] = useState(false);

  const loadRentals = () => {
    if (!token) return;
    setLoading(true);
    getMyRentals(token)
      .then(setRentals)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRentals();
  }, [token]);

  const handleReturnClick = (rental: Rental) => {
    if (!rental.is_returned) {
      setSelectedRental(rental);
    }
  };

  const handleConfirmReturn = async () => {
    if (!selectedRental || !token) return;
    setReturning(true);
    try {
      await returnRental(selectedRental.item.eid, token);
      setSelectedRental(null);
      loadRentals(); // 목록 새로고침
    } catch (err) {
      alert('반납 처리 중 오류가 발생했습니다.');
    } finally {
      setReturning(false);
    }
  };

  const handleCancelReturn = () => {
    setSelectedRental(null);
  };

  if (loading) return <div className="loading">로드 중...</div>;

  return (
    <div>
      <header className="page-header">
        <h2>내 대여기록</h2>
      </header>

      <div className="rental-list">
        {rentals.map((r) => (
          <div
            key={r.id}
            className={`rental-card ${r.is_returned ? 'returned' : 'active'} ${!r.is_returned ? 'clickable' : ''}`}
            onClick={() => handleReturnClick(r)}
            role={!r.is_returned ? 'button' : undefined}
            tabIndex={!r.is_returned ? 0 : undefined}
          >
            <div className="rental-card-header">
              <h3>{r.item.name}</h3>
              <span className={`rental-status ${r.is_returned ? 'returned' : 'active'}`}>
                {r.is_returned ? '반납 완료' : '대여 중'}
              </span>
            </div>
            <p>물품번호: {r.item.eid}</p>
            <p>대여: {formatDateTime(r.rental_start)}</p>
            <p>반납기한: {r.rental_end}</p>
            {r.is_returned && r.return_date && (
              <p>반납: {formatDateTime(r.return_date)}</p>
            )}
            {!r.is_returned && (
              <p className="return-hint">탭하여 반납하기</p>
            )}
          </div>
        ))}

        {rentals.length === 0 && <p className="empty-text">대여기록이 없습니다.</p>}
      </div>

      {selectedRental && (
        <div className="return-modal-bg" onClick={handleCancelReturn}>
          <div className="return-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>반납하시겠습니까?</h3>
            <div className="return-item-info">
              <p className="return-item-name">{selectedRental.item.name}</p>
              <p className="return-item-detail">물품번호: {selectedRental.item.eid}</p>
              <p className="return-item-detail">고유번호: {selectedRental.item.uuid}</p>
              <p className="return-item-date">대여: {formatDateTime(selectedRental.rental_start)}</p>
              <p className="return-item-date">반납기한: {selectedRental.rental_end}</p>
              {selectedRental.item.category.title === '보조배터리' && (
                <p className="return-notice">⚠️ 보조배터리는 학생회실에 직접 반납해 주세요.</p>
              )}
            </div>
            <div className="return-modal-btns">
              <button
                className="return-cancel-btn"
                onClick={handleCancelReturn}
                disabled={returning}
              >
                취소
              </button>
              <button
                className="return-confirm-btn"
                onClick={handleConfirmReturn}
                disabled={returning}
              >
                {returning ? '처리 중...' : '반납하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
