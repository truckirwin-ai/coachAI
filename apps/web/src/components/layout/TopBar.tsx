import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Settings, LogOut, User } from 'lucide-react';
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
  const navigate = useNavigate();
  const { name, role, reset } = useUserStore();
  const pageLabel = ROUTE_LABELS[pathname] ?? 'CoachAI';
  const initials = name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'RJ';

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    reset();
    navigate('/onboarding');
  };

  const handleSettings = () => {
    setOpen(false);
    navigate('/settings');
  };

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

      {/* User avatar + dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
        <div
          onClick={() => setOpen(o => !o)}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: open ? '#17A589' : '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 11, fontWeight: 700,
            cursor: 'pointer', transition: 'background 0.15s',
            userSelect: 'none',
          }}
        >{initials}</div>

        {open && (
          <div style={{
            position: 'absolute', top: 42, right: 0,
            background: 'white', border: '1px solid #e8e8e8',
            borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 200, overflow: 'hidden', zIndex: 300,
          }}>
            {/* User info header */}
            <div style={{
              padding: '14px 16px 12px',
              borderBottom: '1px solid #f0f0f0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#17A589',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>{initials}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.3 }}>
                    {name || 'Your Account'}
                  </div>
                  {role && (
                    <div style={{ fontSize: 11, color: '#888', lineHeight: 1.3 }}>{role}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: '6px 0' }}>
              <MenuItem icon={<User size={14} />} label="Profile" onClick={() => { setOpen(false); navigate('/settings'); }} />
              <MenuItem icon={<Settings size={14} />} label="Settings" onClick={handleSettings} />
              <div style={{ height: 1, background: '#f0f0f0', margin: '6px 0' }} />
              <MenuItem icon={<LogOut size={14} />} label="Log out" onClick={handleLogout} danger />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({
  icon, label, onClick, danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 16px', background: hovered ? (danger ? '#fff5f5' : '#f7f7f5') : 'none',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        fontSize: 13, fontWeight: 500,
        color: danger ? (hovered ? '#e53e3e' : '#c0392b') : (hovered ? '#111' : '#444'),
        transition: 'all 0.1s',
      }}
    >
      <span style={{ color: danger ? 'inherit' : '#888', flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  );
}
