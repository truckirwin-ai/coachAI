import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Toast } from '../ui/Toast';

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
      </main>
      <Toast />
    </div>
  );
}
