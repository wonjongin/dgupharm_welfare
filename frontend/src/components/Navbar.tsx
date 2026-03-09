import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { IoHome, IoQrCode, IoDocumentText, IoSettings } from 'react-icons/io5';
import './Navbar.css';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  matchPrefix: string | null;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: '홈', icon: <IoHome size={22} />, matchPrefix: null },
  { path: '/rental', label: '대여', icon: <IoQrCode size={22} />, matchPrefix: '/rental' },
  { path: '/my-rentals', label: '내 기록', icon: <IoDocumentText size={22} />, matchPrefix: '/my-rentals' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const isActive = (item: NavItem): boolean => {
    if (item.path === '/') {
      return (location.pathname === '/' || location.pathname.startsWith('/items')) &&
        !location.pathname.startsWith('/admin');
    }
    return location.pathname.startsWith(item.matchPrefix || item.path);
  };

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.path}
          className={`nav-btn ${isActive(item) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}

      {user && user.permission === 1 && (
        <button
          className={`nav-btn ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
          onClick={() => navigate('/admin/items')}
        >
          <span className="nav-icon"><IoSettings size={22} /></span>
          <span className="nav-label">관리</span>
        </button>
      )}
    </nav>
  );
}
