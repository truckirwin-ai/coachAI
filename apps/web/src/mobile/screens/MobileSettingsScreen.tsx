import { useSettingsStore } from '../../store/settingsStore';
import { useUserStore } from '../../store/userStore';

function IOSToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 51, height: 31, borderRadius: 16, border: 'none', cursor: 'pointer',
        background: value ? '#17A589' : 'rgba(255,255,255,0.2)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: 27, height: 27, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 2,
        left: value ? 22 : 2,
        transition: 'left 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1,
      color: 'rgba(255,255,255,0.45)', padding: '20px 16px 8px',
    }}>
      {label}
    </div>
  );
}

function SettingsRow({
  label, value, onPress, children, last
}: {
  label: string; value?: string; onPress?: () => void; children?: React.ReactNode; last?: boolean;
}) {
  return (
    <div
      onClick={onPress}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 16px',
        borderBottom: last ? 'none' : '0.5px solid rgba(255,255,255,0.08)',
        cursor: onPress ? 'pointer' : 'default',
      }}
    >
      <span style={{ fontSize: 14, color: 'white' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {value && <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>{value}</span>}
        {children}
        {onPress && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>›</span>}
      </div>
    </div>
  );
}

export function MobileSettingsScreen() {
  const settings = useSettingsStore();
  const { name, role } = useUserStore();

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#000' }}>
      <div style={{ padding: '16px 0 0' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'white', padding: '0 16px 8px' }}>Settings</div>
      </div>

      {/* VOICE */}
      <SectionHeader label="Voice" />
      <div style={{ background: '#1C1C1E', borderRadius: 14, margin: '0 16px', overflow: 'hidden' }}>
        <SettingsRow label="Coach Voice" value={settings.coachVoiceName} onPress={() => {}} />
        <SettingsRow label="Auto-speak">
          <IOSToggle value={settings.voiceEnabled} onChange={v => settings.update({ voiceEnabled: v })} />
        </SettingsRow>
        <SettingsRow label="Speed" value={`${settings.voiceSpeed}×`} last>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0.75, 1.0, 1.25, 1.5].map(s => (
              <button
                key={s}
                onClick={() => settings.update({ voiceSpeed: s })}
                style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer',
                  background: settings.voiceSpeed === s ? '#17A589' : '#2C2C2E',
                  color: settings.voiceSpeed === s ? 'white' : 'rgba(255,255,255,0.6)',
                  fontWeight: settings.voiceSpeed === s ? 700 : 400,
                }}
              >
                {s}×
              </button>
            ))}
          </div>
        </SettingsRow>
      </div>

      {/* SESSION */}
      <SectionHeader label="Session" />
      <div style={{ background: '#1C1C1E', borderRadius: 14, margin: '0 16px', overflow: 'hidden' }}>
        <SettingsRow label="Coaching Style">
          <div style={{ display: 'flex', gap: 6 }}>
            {(['socratic', 'directive', 'balanced'] as const).map(s => (
              <button
                key={s}
                onClick={() => settings.update({ coachingStyle: s })}
                style={{
                  padding: '3px 9px', borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer',
                  background: settings.coachingStyle === s ? '#17A589' : '#2C2C2E',
                  color: settings.coachingStyle === s ? 'white' : 'rgba(255,255,255,0.6)',
                  fontWeight: settings.coachingStyle === s ? 700 : 400,
                  textTransform: 'capitalize',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </SettingsRow>
        <SettingsRow label="Session Length" last>
          <div style={{ display: 'flex', gap: 6 }}>
            {[15, 30, 45, 60].map(m => (
              <button
                key={m}
                onClick={() => settings.update({ sessionLength: m })}
                style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer',
                  background: settings.sessionLength === m ? '#17A589' : '#2C2C2E',
                  color: settings.sessionLength === m ? 'white' : 'rgba(255,255,255,0.6)',
                  fontWeight: settings.sessionLength === m ? 700 : 400,
                }}
              >
                {m}m
              </button>
            ))}
          </div>
        </SettingsRow>
      </div>

      {/* DISPLAY */}
      <SectionHeader label="Display" />
      <div style={{ background: '#1C1C1E', borderRadius: 14, margin: '0 16px', overflow: 'hidden' }}>
        <SettingsRow label="Font Size">
          <div style={{ display: 'flex', gap: 6 }}>
            {(['small', 'medium', 'large'] as const).map(s => (
              <button
                key={s}
                onClick={() => settings.update({ fontSize: s })}
                style={{
                  padding: '3px 9px', borderRadius: 6, fontSize: 11, border: 'none', cursor: 'pointer',
                  background: settings.fontSize === s ? '#17A589' : '#2C2C2E',
                  color: settings.fontSize === s ? 'white' : 'rgba(255,255,255,0.6)',
                  fontWeight: settings.fontSize === s ? 700 : 400,
                  textTransform: 'capitalize',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </SettingsRow>
        <SettingsRow label="Show Timestamps" last>
          <IOSToggle value={settings.showTimestamps} onChange={v => settings.update({ showTimestamps: v })} />
        </SettingsRow>
      </div>

      {/* ACCOUNT */}
      <SectionHeader label="Account" />
      <div style={{ background: '#1C1C1E', borderRadius: 14, margin: '0 16px', overflow: 'hidden' }}>
        <SettingsRow label="Name" value={name || 'Sarah Chen'} />
        <SettingsRow label="Role" value={role || 'Learner'} last />
      </div>

      <div style={{ height: 30 }} />
    </div>
  );
}
