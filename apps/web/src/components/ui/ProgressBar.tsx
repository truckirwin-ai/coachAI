export function ProgressBar({ value, height = 5 }: { value: number; height?: number }) {
  return (
    <div style={{ height, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: '#17A589', borderRadius: 3, transition: 'width .3s' }} />
    </div>
  );
}
