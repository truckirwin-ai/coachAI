import { domainColors } from '../../data/mockData';

export function DomainBadge({ domain }: { domain: string }) {
  const colors = domainColors[domain] || { bg: '#F0EBE0', text: '#5A4A35' };
  return (
    <span style={{
      background: colors.bg, color: colors.text,
      padding: '2px 8px', borderRadius: 4,
      fontSize: 11, fontWeight: 600, display: 'inline-block',
    }}>{domain}</span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; text: string; icon: string }> = {
    Voice:      { bg: '#EBF8FF', text: '#2C5282', icon: '🎙' },
    Evaluation: { bg: '#FFFBEB', text: '#744210', icon: '📋' },
    Text:       { bg: '#F0FFF4', text: '#276749', icon: '💬' },
    Curriculum: { bg: '#EBF4FF', text: '#2B6CB0', icon: '📘' },
    Refresher:  { bg: '#FAF5FF', text: '#553C9A', icon: '🔄' },
  };
  const s = map[type] || { bg: '#F0EBE0', text: '#5A4A35', icon: '💬' };
  return (
    <span style={{
      background: s.bg, color: s.text,
      padding: '2px 8px', borderRadius: 4,
      fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>{s.icon} {type}</span>
  );
}
