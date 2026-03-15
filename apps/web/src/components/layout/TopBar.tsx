import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/coaching': 'Coaching',
  '/library': 'Library',
  '/evaluations': 'Evaluations',
  '/progress': 'Progress',
  '/settings': 'Settings',
};

export function TopBar() {
  const { pathname } = useLocation();
  const { name } = useUserStore();
  const pageLabel = ROUTE_LABELS[pathname] ?? 'CoachAI';
  const initials = name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'RJ';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 56,
      background: 'white', borderBottom: '1px solid #e8e8e8',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 12, zIndex: 200,
    }}>
      {/* Logo + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7, background: '#111',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 13, fontWeight: 800,
        }}>C</div>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>CoachAI</span>
      </div>
      <span style={{ color: '#ccc', fontSize: 16, flexShrink: 0 }}>/</span>
      <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>{pageLabel}</span>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      <input
        placeholder="Search..."
        style={{
          width: 200, height: 34, borderRadius: 20, border: 'none',
          background: '#f4f4f4', padding: '0 14px', fontSize: 13,
          color: '#333', outline: 'none',
        }}
      />

      {/* Bell */}
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#888', padding: 6 }}>
        <Bell size={18} />
      </button>

      {/* User avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', background: '#111',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0, cursor: 'pointer',
      }}>{initials}</div>
    </div>
  );
}
