import { useEffect } from 'react';
import { useToastStore } from '../../store/toastStore';

export function Toast() {
  const { message, visible, hide } = useToastStore();

  useEffect(() => {
    if (visible) {
      const t = setTimeout(hide, 2500);
      return () => clearTimeout(t);
    }
  }, [visible, hide]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      background: '#1B3A5C',
      color: 'white',
      padding: '12px 20px',
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 600,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      zIndex: 9999,
      animation: 'fadeInUp 0.2s ease',
    }}>
      {message}
    </div>
  );
}
