import React, { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { createRental, returnRental } from '../api/rentals';
import QRScanner from '../components/QRScanner';
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
  const navigate = useNavigate();
  const locationState = location.state as LocationState | null;

  const [mode, setMode] = useState<Mode>(locationState?.mode || 'rent');
  const [step, setStep] = useState<Step>('prompt');
  const [result, setResult] = useState<Rental | null>(null);
  const [error, setError] = useState('');
  const [manualUuid, setManualUuid] = useState('');
  const [selectedItem, setSelectedItem] = useState<ItemWithStatus | null>(locationState?.item || null);

  const reset = () => {
    setStep('prompt');
    setResult(null);
    setError('');
    setManualUuid('');
    setSelectedItem(null);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    reset();
  };

  const processUuid = async (uuid: string) => {
    if (!token) return;
    setStep('loading');
    setError('');
    try {
      const data = mode === 'rent'
        ? await createRental(uuid, token)
        : await returnRental(uuid, token);
      setResult(data);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.detail || '오류가 발생했습니다');
      setStep('error');
    }
  };

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (manualUuid.trim()) processUuid(manualUuid.trim());
  };

  const handleConfirmRental = () => {
    if (selectedItem) {
      processUuid(selectedItem.uuid);
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
              <p className="confirm-item-detail">고유번호: {selectedItem.uuid}</p>
              <p className="confirm-item-category">{selectedItem.category.title}</p>
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
          <p>아래 버튼을 클릭하여<br />물품의 QR코드를 스캔하세요</p>
          <button className="scan-btn" onClick={() => setStep('scanning')}>QR코드 스캔</button>

          <form className="manual-form" onSubmit={handleManualSubmit}>
            <input
              type="text"
              placeholder="테스트용: UUID 직접 입력"
              value={manualUuid}
              onChange={(e) => setManualUuid(e.target.value)}
            />
            <button type="submit">입력</button>
          </form>
        </div>
      )}

      {step === 'scanning' && (
        <QRScanner
          onScan={processUuid}
          onClose={() => setStep('prompt')}
        />
      )}

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
