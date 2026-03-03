import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toast } from '../ui/Toast';

export function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
