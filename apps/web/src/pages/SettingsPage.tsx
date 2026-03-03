import { useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { generateSpeech, playAudio } from '../api/elevenlabs';
import { PageHeader } from '../components/layout/PageHeader';

const AVAILABLE_VOICES = [
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', description: 'Playful, bright, warm', gender: 'female' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', description: 'Knowledgeable, professional', gender: 'female' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Mature, reassuring', gender: 'female' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', description: 'Smooth, trustworthy', gender: 'male' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', description: 'Relaxed, conversational', gender: 'male' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', description: 'Charming, down-to-earth', gender: 'male' },
];

const COACHING_STYLES = [
  {
    id: 'socratic' as const,
    label: 'Socratic',
    description: 'Your coach asks questions rather than giving answers. Best for self-discovery.',
  },
  {
    id: 'directive' as const,
    label: 'Directive',
    description: 'Your coach gives clear frameworks, models, and direct advice.',
  },
  {
    id: 'balanced' as const,
    label: 'Balanced',
    description: 'A mix of questions and guidance, adapting to the conversation.',
  },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'var(--border)',
        position: 'relative',
        transition: 'background .2s',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'white',
          transition: 'left .2s',
          boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        }}
      />
    </button>
  );
}

function PillGroup<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            border: `1.5px solid ${value === opt.value ? 'var(--accent)' : 'var(--border)'}`,
            background: value === opt.value ? 'var(--accent-light)' : 'transparent',
            color: value === opt.value ? 'var(--accent)' : 'var(--text-2)',
            fontSize: 13,
            fontWeight: value === opt.value ? 600 : 400,
            cursor: 'pointer',
            transition: 'all .15s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const settings = useSettingsStore();
  const { update, reset } = settings;
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  async function previewVoice(voiceId: string, name: string) {
    if (previewingId) return;
    setPreviewingId(voiceId);
    try {
      const phrase = `Hi, I'm ${name}. I'll be your coach today. Let's get to work.`;
      const url = await generateSpeech(phrase, voiceId);
      await playAudio(url);
    } catch {
      // preview failure is silent
    } finally {
      setPreviewingId(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <PageHeader
        title="Settings"
        subtitle="Configure your coaching experience"
        action={
          <button onClick={reset} style={{
            fontSize: 13, color: '#E53E3E', background: 'none', border: 'none',
            cursor: 'pointer', fontWeight: 500,
          }}>Reset to defaults</button>
        }
      />

      <div style={{ padding: '24px 28px', maxWidth: 720 }}>
      {/* Section 1: Coach Voice */}
      <div style={{ marginBottom: 28 }}>
        <p className="section-label">Coach Voice</p>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>
          Choose the voice your AI coach uses during sessions and when reading content
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          {AVAILABLE_VOICES.map((voice) => {
            const selected = settings.coachVoiceId === voice.id;
            return (
              <div
                key={voice.id}
                className="card"
                onClick={() => update({ coachVoiceId: voice.id, coachVoiceName: voice.name })}
                style={{
                  cursor: 'pointer',
                  border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                  background: selected ? 'var(--accent-light)' : 'var(--white)',
                  padding: '14px 16px',
                  position: 'relative',
                }}
              >
                {selected && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      color: 'var(--accent)',
                      fontSize: 16,
                    }}
                  >
                    ✓
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{voice.name}</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: voice.gender === 'female' ? '#FED7E2' : '#BEE3F8',
                      color: voice.gender === 'female' ? '#97266D' : '#2B6CB0',
                    }}
                  >
                    {voice.gender === 'female' ? 'F' : 'M'}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
                  {voice.description}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    previewVoice(voice.id, voice.name);
                  }}
                  disabled={previewingId !== null}
                  style={{
                    fontSize: 12,
                    color: previewingId === voice.id ? 'var(--text-3)' : 'var(--accent)',
                    background: 'transparent',
                    border: 'none',
                    cursor: previewingId !== null ? 'default' : 'pointer',
                    padding: 0,
                    fontWeight: 500,
                  }}
                >
                  {previewingId === voice.id ? '⏳ Playing…' : '▶ Preview'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Voice & Audio */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="section-label" style={{ marginBottom: 16 }}>Voice & Audio</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Auto-speak responses</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Coach responses are read aloud automatically after each message
            </p>
          </div>
          <Toggle checked={settings.voiceEnabled} onChange={(v) => update({ voiceEnabled: v })} />
        </div>

        <div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Speaking speed</p>
          <PillGroup
            options={[
              { label: '0.75x', value: 0.75 },
              { label: '1x', value: 1.0 },
              { label: '1.25x', value: 1.25 },
              { label: '1.5x', value: 1.5 },
            ]}
            value={settings.voiceSpeed}
            onChange={(v) => update({ voiceSpeed: v })}
          />
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
            Speed applies to coaching session voice
            {/* Note: ElevenLabs flash model (eleven_flash_v2_5) does not support speed adjustment via API — reserved for future implementation */}
          </p>
        </div>
      </div>

      {/* Section 3: Session Preferences */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="section-label" style={{ marginBottom: 16 }}>Session Preferences</p>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Default session length</p>
          <PillGroup
            options={[
              { label: '15 min', value: 15 },
              { label: '30 min', value: 30 },
              { label: '45 min', value: 45 },
              { label: '60 min', value: 60 },
            ]}
            value={settings.sessionLength}
            onChange={(v) => update({ sessionLength: v })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Topic suggestions</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Show related topics after each coach response
            </p>
          </div>
          <Toggle
            checked={settings.autoSuggestTopics}
            onChange={(v) => update({ autoSuggestTopics: v })}
          />
        </div>
      </div>

      {/* Section 4: Coaching Style */}
      <div style={{ marginBottom: 16 }}>
        <p className="section-label" style={{ marginBottom: 10 }}>Coaching Style</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COACHING_STYLES.map((style) => {
            const selected = settings.coachingStyle === style.id;
            return (
              <div
                key={style.id}
                className="card"
                onClick={() => update({ coachingStyle: style.id })}
                style={{
                  cursor: 'pointer',
                  border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                  background: selected ? 'var(--accent-light)' : 'var(--white)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                    background: selected ? 'var(--accent)' : 'transparent',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selected && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{style.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{style.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 5: Display */}
      <div className="card" style={{ marginBottom: 28 }}>
        <p className="section-label" style={{ marginBottom: 16 }}>Display</p>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Font size</p>
          <PillGroup
            options={[
              { label: 'Small', value: 'small' as const },
              { label: 'Medium', value: 'medium' as const },
              { label: 'Large', value: 'large' as const },
            ]}
            value={settings.fontSize}
            onChange={(v) => update({ fontSize: v })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Show timestamps</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Display time on each message</p>
          </div>
          <Toggle
            checked={settings.showTimestamps}
            onChange={(v) => update({ showTimestamps: v })}
          />
        </div>
      </div>


      {/* Section: API Keys */}
      <div style={{ marginBottom: 28, marginTop: 8 }}>
        <p className="section-label">API Keys</p>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>
          Required for the deployed app. Keys are stored locally in your browser only.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
              Anthropic API Key (Claude)
            </label>
            <input
              type="password"
              placeholder="sk-ant-..."
              defaultValue={settings.anthropicApiKey}
              onBlur={(e) => update({ anthropicApiKey: e.target.value.trim() })}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                border: '1.5px solid var(--border)', background: 'var(--white)',
                fontSize: 13, color: 'var(--text)', fontFamily: 'monospace',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
              Get yours at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>console.anthropic.com</a>
            </p>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
              ElevenLabs API Key (Voice)
            </label>
            <input
              type="password"
              placeholder="your-elevenlabs-key"
              defaultValue={settings.elevenLabsApiKey}
              onBlur={(e) => update({ elevenLabsApiKey: e.target.value.trim() })}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                border: '1.5px solid var(--border)', background: 'var(--white)',
                fontSize: 13, color: 'var(--text)', fontFamily: 'monospace',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
              Get yours at <a href="https://elevenlabs.io" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>elevenlabs.io</a>
            </p>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>Settings are saved automatically</p>
      </div>
    </div>
  );
}
