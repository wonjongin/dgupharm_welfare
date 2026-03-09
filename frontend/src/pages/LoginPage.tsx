import { useState, FormEvent } from 'react';
import { useAuthStore } from '../store/authStore';
import './LoginPage.css';

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);

  const [sid, setSid] = useState('');
  const [name, setName] = useState('');
  const [isRegister] = useState(false);  // 현재는 로그인만 사용
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(sid, name);
      } else {
        await login(sid, name);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      if (!isRegister && err.response?.status === 401) {
        setError('등록되지 않은 학번입니다. 아래에서 회원가입을 진행하세요.');
      } else {
        setError(msg || '오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="login-title">동국대학교<br />약학대학</h1>
        <p className="login-sub">학생복지시스템</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>학번</label>
          <input
            type="text"
            value={sid}
            onChange={(e) => setSid(e.target.value)}
            placeholder="학번을 입력하세요"
            autoComplete="off"
            required
          />

          <label>이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            autoComplete="off"
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '처리 중...' : isRegister ? '회원가입' : '로그인'}
          </button>
        </form>

        {/* <button className="login-toggle" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
          {isRegister ? '이미 회원이세요? → 로그인' : '회원이 아니세요? → 회원가입'}
        </button> */}
      </div>
    </div>
  );
}
