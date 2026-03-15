// © 2025 Foundry SMB LLC. All rights reserved.
// CoachAI — AppLayout (main authenticated shell)

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Toast } from '../ui/Toast';

const YEAR = new Date().getFullYear();

export function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <TopBar />
      <Sidebar />
      <main style={{
        marginLeft: 240,
        marginTop: 56,
        flex: 1,
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        <Outlet />
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--border)',
          fontSize: 11,
          color: '#ccc',
          flexShrink: 0,
          background: 'var(--bg)',
        }}>
          © {YEAR} Foundry SMB LLC. All rights reserved.
        </div>
      </main>
      <Toast />
    </div>
  );
}
