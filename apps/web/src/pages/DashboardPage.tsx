import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useToastStore } from '../store/toastStore';
import { mockSessions, mockGoals } from '../data/mockData';
import { ProgressBar } from '../components/ui/ProgressBar';
import { lessons } from '../data/lessons';
import type { Lesson } from '../data/lessons';
import { LessonPlayer } from '../components/lessons/LessonPlayer';
import { PageHeader } from '../components/layout/PageHeader';

const weekDots = [
  { done: true },
  { current: true },
  { upcoming: true },
  { upcoming: true },
  { upcoming: true },
];

const recommendedLessons = lessons.slice(0, 3);

const sessionBorderColor = (type: string) => {
  if (type === 'Voice') return '#17A589';
  if (type === 'Evaluation') return '#D69E2E';
  return '#553C9A';
};

export function DashboardPage() {
  const { name } = useUserStore();
  const navigate = useNavigate();
  const { show } = useToastStore();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionText, setReflectionText] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleSaveReflection = () => {
    if (!reflectionText.trim()) return;
    const existing = JSON.parse(localStorage.getItem('reflections') || '[]');
    localStorage.setItem('reflections', JSON.stringify([...existing, { text: reflectionText, date: new Date().toISOString() }]));
    setReflectionText('');
    setShowReflectionModal(false);
    show('✅ Reflection saved!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Dashboard"
        subtitle={`${greeting}, ${name || 'there'} · ${date}`}
        action={
          <button
            onClick={() => navigate('/coaching')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#17A589', color: 'white',
              fontSize: 13, fontWeight: 600,
            }}
          >
            ▶ Start Session
          </button>
        }
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Skills Completed', value: '4', sub: 'of 8 in current program' },
          { label: 'Avg. Eval Score', value: '81', sub: 'across all evaluations' },
          { label: 'Session Streak', value: '12 days', sub: 'Best: 18 days' },
        ].map((s, i) => (
          <div key={i} className="card">
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>{s.label}</div>
            <div className="stat-number">{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Current Program */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #154360 100%)',
        borderRadius: 12, padding: '28px 30px', color: 'white', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,.07)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,.2)', fontSize: 11, fontWeight: 600, marginBottom: 10 }}>Leadership Track</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Difficult Conversations</h3>
            <p style={{ fontSize: 12, opacity: .75, marginBottom: 20, lineHeight: 1.5 }}>Week 2 of 4 — Refresher #2 due today. Practice navigating performance feedback with directness and empathy.</p>
            {/* Week track */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              {weekDots.map((d, i) => (
                <React.Fragment key={i}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: d.done ? 'white' : d.current ? 'white' : 'rgba(255,255,255,.25)',
                    boxShadow: d.current ? '0 0 0 3px rgba(255,255,255,.3)' : 'none',
                  }} />
                  {i < weekDots.length - 1 && <div style={{ flex: 1, height: 2, background: d.done ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.2)', borderRadius: 2 }} />}
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('/coaching')} style={{ background: 'white', color: '#1B3A5C', padding: '9px 20px', borderRadius: 7, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>▶ Start Today's Refresher</button>
              <button onClick={() => navigate('/library')} style={{ background: 'rgba(255,255,255,.15)', color: 'white', padding: '9px 20px', borderRadius: 7, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>View Module</button>
            </div>
          </div>
          <div style={{ background: 'rgba(255,191,0,.2)', border: '1px solid rgba(255,191,0,.4)', color: '#FFD700', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>Eval in 12 days</div>
        </div>
      </div>

      {/* Two column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Recent sessions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Recent Sessions</span>
            <span onClick={() => navigate('/coaching')} style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>View all →</span>
          </div>
          {mockSessions.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0 10px 12px', borderBottom: '1px solid var(--border)',
              borderLeft: `3px solid ${sessionBorderColor(s.type)}`,
              marginBottom: 2,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.skill}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{s.type} · {s.meta}</div>
              </div>
              {s.score ? (
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', background: 'var(--success-light)', padding: '2px 8px', borderRadius: 6 }}>{s.score}</span>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Goals */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Active Goals</span>
            <span onClick={() => navigate('/goals')} style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>Manage →</span>
          </div>
          {mockGoals.map(g => (
            <div key={g.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{g.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{g.pct}%</span>
              </div>
              <ProgressBar value={g.pct} />
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Target: {g.due}</div>
            </div>
          ))}
          <button className="btn btn-outline" onClick={() => setShowReflectionModal(true)} style={{ width: '100%', justifyContent: 'center', marginTop: 12, fontSize: 12 }}>+ Record a reflection</button>
        </div>
      </div>

      {/* Recommended Talks */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Recommended Talks</span>
          <span onClick={() => navigate('/library')} style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>Browse library →</span>
        </div>
        {recommendedLessons.map((lesson, i) => (
          <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < recommendedLessons.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, marginBottom: 2 }}>
                {lesson.format === 'ted-talk' ? '🎤' : '🎙'}
                <span style={{ marginLeft: 4, fontSize: 10, background: '#f0f0f0', color: '#666', padding: '1px 6px', borderRadius: 8 }}>{lesson.domain}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{lesson.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{lesson.durationMins} min · {lesson.skillLinks[0]}</div>
            </div>
            <button
              onClick={() => setActiveLesson(lesson)}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--accent-light)',
                border: 'none', color: 'var(--accent)',
                cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >▶</button>
          </div>
        ))}
      </div>
      {activeLesson && (
        <LessonPlayer lesson={activeLesson} onClose={() => setActiveLesson(null)} />
      )}

      {/* Reflection Modal */}
      {showReflectionModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowReflectionModal(false)}>
          <div style={{
            background: 'white', borderRadius: 12, padding: 24, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>Record a Reflection</h3>
            <textarea
              value={reflectionText}
              onChange={e => setReflectionText(e.target.value)}
              placeholder="What did you learn? What will you do differently?"
              rows={5}
              style={{
                width: '100%', borderRadius: 8, border: '1.5px solid var(--border)',
                padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
                color: 'var(--text)', resize: 'vertical', boxSizing: 'border-box', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowReflectionModal(false)} className="btn btn-outline" style={{ fontSize: 13 }}>Cancel</button>
              <button onClick={handleSaveReflection} className="btn btn-primary" style={{ fontSize: 13 }}>Save Reflection</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
