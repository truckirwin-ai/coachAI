import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, BookOpen,
  ClipboardCheck, BarChart2, Settings, Smartphone,
  type LucideIcon,
} from 'lucide-react';

type NavItem = { to: string; icon: LucideIcon; label: string };
type Section = { label: string; items: NavItem[] };

const sections: Section[] = [
  {
    label: 'Coaching',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/coaching',  icon: MessageSquare,   label: 'Coaching' },
      { to: '/library',   icon: BookOpen,        label: 'Library' },
    ],
  },
  {
    label: 'Track',
    items: [
      { to: '/evaluations', icon: ClipboardCheck, label: 'Evaluations' },
      { to: '/progress',    icon: BarChart2,      label: 'Progress' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

function SideNavItem({ to, icon: Icon, label }: NavItem) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '8px 10px', borderRadius: 8,
        textDecoration: 'none', fontSize: 13.5,
        color: isActive ? '#17A589' : '#555',
        background: isActive ? '#e8f5f1' : 'transparent',
        fontWeight: isActive ? 600 : 400,
        transition: 'background 0.12s, color 0.12s',
        marginBottom: 2,
      })}
      onMouseEnter={(e) => {
        // Only apply hover bg if not the active link
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.background = '#f4f4f4';
        }
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <Icon size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      position: 'fixed',
      top: 56,
      left: 0,
      height: 'calc(100vh - 56px)',
      background: 'white',
      borderRight: '1px solid #e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <nav style={{ flex: 1, padding: '4px 12px 12px' }}>
        {sections.map((section) => (
          <div key={section.label}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#aaa',
              padding: '18px 8px 6px',
            }}>
              {section.label}
            </div>
            {section.items.map((item) => (
              <SideNavItem key={item.to} {...item} />
            ))}
          </div>
        ))}
      </nav>

      {/* Mobile preview */}
      <a
        href="/mobile"
        target="_blank"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 20px', color: '#bbb', fontSize: 12,
          textDecoration: 'none', borderTop: '1px solid #e8e8e8',
          transition: 'color 0.15s', flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#666')}
        onMouseLeave={e => (e.currentTarget.style.color = '#bbb')}
      >
        <Smartphone size={13} />
        Mobile Preview
      </a>
    </aside>
  );
}
