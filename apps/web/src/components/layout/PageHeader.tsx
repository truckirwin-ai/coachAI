import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={{
      padding: '16px 28px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center',
      flexShrink: 0, gap: 16,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 800, color: 'var(--text)',
          letterSpacing: '-0.5px', lineHeight: 1.1, margin: 0,
        }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0', fontWeight: 400 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
