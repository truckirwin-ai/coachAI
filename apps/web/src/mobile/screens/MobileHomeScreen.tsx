import { useState } from 'react';
import { lessons } from '../../data/lessons';
import type { Lesson } from '../../data/lessons';
import { MobileLessonPlayer } from '../MobileLessonPlayer';

interface Props {
  onNavigate: (tab: string) => void;
}

const weekDots = [true, true, false, false, false];

const recentActivity = [
  { label: 'Difficult Conversations', type: 'Voice Session', color: '#17A589', time: 'Today' },
  { label: 'Leadership Eval Score: 84%', type: 'Evaluation', color: '#D69E2E', time: 'Yesterday' },
  { label: 'Giving Effective Feedback', type: 'TED Talk', color: '#553C9A', time: '2 days ago' },
];

export function MobileHomeScreen({ onNavigate }: Props) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const recommended = lessons.slice(0, 3);

  return (
    <div style={{
      height: '100%', overflowY: 'auto', background: '#000',
      padding: '16px 16px 0',
    }}>
      {/* Greeting */}
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 4 }}>
        {greeting}, Sarah
      </h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
        Monday, March 2
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Sessions', value: '14' },
          { label: 'Skills', value: '4' },
          { label: 'Streak', value: '12d' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#1C1C1E', borderRadius: 14, padding: '14px 10px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Current Program */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #0E2840 100%)',
        borderRadius: 16, padding: 16, marginBottom: 16,
        borderLeft: '3px solid #17A589',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#17A589', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          Current Program
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 4 }}>
          Difficult Conversations
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
          Week 2 of 4 · Leadership Track
        </div>
        {/* Week dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          {weekDots.map((done, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: done ? 'white' : 'rgba(255,255,255,0.25)',
              boxShadow: i === 2 ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none',
            }} />
          ))}
        </div>
        <button
          onClick={() => onNavigate('coaching')}
          style={{
            background: '#17A589', color: 'white', border: 'none', borderRadius: 14,
            padding: '13px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            width: '100%',
          }}
        >
          Continue Session →
        </button>
      </div>

      {/* Recent Activity */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 10 }}>Recent Activity</div>
        <div style={{ background: '#1C1C1E', borderRadius: 14, overflow: 'hidden' }}>
          {recentActivity.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              borderBottom: i < recentActivity.length - 1 ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
              borderLeft: `3px solid ${a.color}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{a.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{a.type}</div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{a.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 10 }}>Recommended</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {recommended.map(lesson => (
            <div key={lesson.id} style={{
              background: '#1C1C1E', borderRadius: 14, padding: 14,
              minWidth: 200, flexShrink: 0,
            }}>
              <div style={{ fontSize: 10, background: '#2C2C2E', color: '#17A589', padding: '2px 8px', borderRadius: 8, display: 'inline-block', marginBottom: 8 }}>
                {lesson.format === 'ted-talk' ? 'TED Talk' : 'Podcast'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 6 }}>
                {lesson.title}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>
                {lesson.durationMins} min · {lesson.domain}
              </div>
              <button
                onClick={() => setActiveLesson(lesson)}
                style={{
                  background: '#17A589', color: 'white', border: 'none', borderRadius: 10,
                  padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                ▶ Play
              </button>
            </div>
          ))}
        </div>
      </div>

      {activeLesson && <MobileLessonPlayer lesson={activeLesson} onClose={() => setActiveLesson(null)} />}
    </div>
  );
}
