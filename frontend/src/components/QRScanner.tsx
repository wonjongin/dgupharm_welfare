import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import './QRScanner.css';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const didScan = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    didScan.current = false;

    // iOS Safari 호환을 위한 설정
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      // iOS에서 더 나은 성능을 위한 추가 설정
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      }
    };

    // 후면 카메라 선택 (iOS/Android 모두 호환)
    const qrCodeSuccessCallback = (decodedText: string) => {
      if (didScan.current) return;
      didScan.current = true;

      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner.stop().then(() => onScan(decodedText)).catch(console.error);
      } else {
        onScan(decodedText);
      }
    };

    // 환경 카메라 (후면 카메라) 사용
    scanner.start(
      { facingMode: 'environment' },
      config,
      qrCodeSuccessCallback,
      () => {} // 에러 프레임 무시
    ).catch((err) => {
      console.error('QR Scanner Error:', err);
      setError('카메라에 접근할 수 없습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
    });

    return () => {
      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="qr-scanner-wrap">
      {error ? (
        <div className="qr-error">
          <p>{error}</p>
          <button className="qr-cancel-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      ) : (
        <>
          <div id="qr-reader" />
          <p className="qr-guide">QR 코드를 화면 중앙에 맞춰주세요</p>
          <button className="qr-cancel-btn" onClick={onClose}>
            취소
          </button>
        </>
      )}
    </div>
  );
}
