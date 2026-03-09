import { useState, useEffect, FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { createRental, returnRental } from '../api/rentals';
// TODO: v2.0에서 QR 기능 활성화
// import QRScanner from '../components/QRScanner';
import type { Rental, ItemWithStatus } from '../types';
import './RentalPage.css';

type Mode = 'rent' | 'return';
type Step = 'prompt' | 'confirm' | 'scanning' | 'loading' | 'success' | 'error';

interface LocationState {
  item?: ItemWithStatus;
  mode?: Mode;
}

export default function RentalPage() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [mode, setMode] = useState<Mode>(locationState?.mode || 'rent');
  const [step, setStep] = useState<Step>('prompt');
  const [result, setResult] = useState<Rental | null>(null);
  const [error, setError] = useState('');
  const [manualEid, setManualEid] = useState('');
  const [selectedItem, setSelectedItem] = useState<ItemWithStatus | null>(locationState?.item || null);

  const reset = () => {
    setStep('prompt');
    setResult(null);
    setError('');
    setManualEid('');
    setSelectedItem(null);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    reset();
  };

  const processEid = async (eid: string) => {
    if (!token) return;
    setStep('loading');
    setError('');
    try {
      const data = mode === 'rent'
        ? await createRental(eid, token)
        : await returnRental(eid, token);
      setResult(data);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.detail || '오류가 발생했습니다');
      setStep('error');
    }
  };

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (manualEid.trim()) processEid(manualEid.trim());
  };

  const handleConfirmRental = () => {
    if (selectedItem) {
      processEid(selectedItem.eid);
    }
  };

  const handleCancelConfirm = () => {
    setSelectedItem(null);
    setStep('prompt');
  };

  // Handle incoming item from navigation state
  useEffect(() => {
    if (locationState?.item) {
      setStep('confirm');
    }
  }, [locationState?.item]);

  return (
    <div>
      <header className="page-header">
        <h2>대여 / 반납</h2>
      </header>

      <div className="rental-tabs">
        <button className={`rental-tab ${mode === 'rent' ? 'active' : ''}`} onClick={() => switchMode('rent')}>대여</button>
        <button className={`rental-tab ${mode === 'return' ? 'active' : ''}`} onClick={() => switchMode('return')}>반납</button>
      </div>

      {step === 'confirm' && selectedItem && (
        <div className="rental-confirm">
          <div className="confirm-card">
            <h3>대여하시겠습니까?</h3>
            <div className="confirm-item-info">
              <p className="confirm-item-name">{selectedItem.name}</p>
              <p className="confirm-item-detail">물품번호: {selectedItem.eid}</p>
              <p className="confirm-item-category">{selectedItem.category.title}</p>
            </div>
            <div className="confirm-penalty-notice">
              <p className="penalty-warning">⚠️ 대여하지 않은 물품을 무단으로 가져갈 경우</p>
              <p className="penalty-text">학생복지위원회 규정에 따라 제재를 받을 수 있습니다.</p>
            </div>
            <div className="confirm-btns">
              <button className="confirm-cancel-btn" onClick={handleCancelConfirm}>취소</button>
              <button className="confirm-rent-btn" onClick={handleConfirmRental}>대여하기</button>
            </div>
          </div>
        </div>
      )}

      {step === 'prompt' && (
        <div className="rental-prompt">
          {/* TODO: v2.0에서 QR 기능 활성화 */}
          {/* <p>아래 버튼을 클릭하여<br />물품의 QR코드를 스캔하세요</p> */}
          {/* <button className="scan-btn" onClick={() => setStep('scanning')}>QR코드 스캔</button> */}

          <p>물품번호(eid)를 입력하세요</p>
          <form className="manual-form" onSubmit={handleManualSubmit}>
            <input
              type="text"
              placeholder="물품번호(eid) 입력"
              value={manualEid}
              onChange={(e) => setManualEid(e.target.value)}
            />
            <button type="submit">확인</button>
          </form>
        </div>
      )}

      {/* TODO: v2.0에서 QR 기능 활성화 */}
      {/* {step === 'scanning' && (
        <QRScanner
          onScan={processEid}
          onClose={() => setStep('prompt')}
        />
      )} */}

      {step === 'loading' && <div className="loading">처리 중...</div>}

      {step === 'error' && (
        <div className="rental-error">
          <p>{error}</p>
          <button className="retry-btn" onClick={reset}>다시 시도</button>
        </div>
      )}

      {step === 'success' && result && (
        <div className="rental-success">
          <h3>{mode === 'rent' ? '대여 완료!' : '반납 완료!'}</h3>
          <p>물품: <strong>{result.item.name}</strong></p>
          <p>물품번호: {result.item.eid}</p>
          {mode === 'rent' && <p>반납 기한: {result.rental_end}</p>}
          <button className="done-btn" onClick={reset}>완료</button>
        </div>
      )}
    </div>
  );
}
