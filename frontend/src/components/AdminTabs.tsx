import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/admin', label: '대시보드' },
  { path: '/admin/rentals', label: '대여내역' },
  { path: '/admin/items', label: '물품' },
  { path: '/admin/categories', label: '카테고리' },
];

export default function AdminTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="admin-sub-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.path}
          className={`admin-sub-tab ${location.pathname === tab.path ? 'active' : ''}`}
          onClick={() => navigate(tab.path)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
