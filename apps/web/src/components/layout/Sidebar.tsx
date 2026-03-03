import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, BarChart2, BookOpen, CheckSquare, Settings, Smartphone } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/coaching', icon: MessageSquare, label: 'Coaching' },
  { to: '/library', icon: BookOpen, label: 'Library' },
  { to: '/evaluations', icon: CheckSquare, label: 'Evaluations' },
  { to: '/progress', icon: BarChart2, label: 'Progress' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { name, role } = useUserStore();
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U';

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: '#1B3A5C',
      borderRight: 'none',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'fixed', left: 0, top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #17A589, #0E8A72)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 800, color: 'white', letterSpacing: '-0.5px',
        }}>C</div>
        <span style={{ fontWeight: 800, fontSize: 17, color: 'white', letterSpacing: '-0.3px' }}>CoachAI</span>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 0', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'rgba(255,255,255,.35)', padding: '8px 20px 6px' }}>Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 20px', textDecoration: 'none',
            color: isActive ? 'white' : 'rgba(255,255,255,.65)',
            background: isActive ? 'rgba(255,255,255,.15)' : 'transparent',
            fontWeight: isActive ? 600 : 400,
            fontSize: 13.5,
            borderLeft: isActive ? '2px solid white' : '2px solid transparent',
            transition: 'all .12s',
          })}>
            <Icon size={16} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #17A589, #0E8A72)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>{initials}</div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name || 'User'}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{role || 'Learner'}</div>
        </div>
      </div>

      {/* Mobile Preview */}
      <a href="/mobile" target="_blank" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', marginTop: 0,
        color: 'rgba(255,255,255,0.4)', fontSize: 12,
        textDecoration: 'none', borderTop: '1px solid rgba(255,255,255,0.08)',
        transition: 'color .15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
      >
        <Smartphone size={14} />
        Mobile Preview
      </a>
    </aside>
  );
}
