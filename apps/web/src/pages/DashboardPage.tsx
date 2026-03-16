// © 2026 Foundry SMB LLC. All rights reserved.
// CoachAI — DashboardPage

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useToastStore } from '../store/toastStore';
import { mockSessions, mockGoals } from '../data/mockData';
import { ProgressBar } from '../components/ui/ProgressBar';
import { lessons } from '../data/lessons';
import type { Lesson } from '../data/lessons';
import { LessonPlayer } from '../components/lessons/LessonPlayer';
import { COACHES as coaches, DEFAULT_COACH_ID } from '../data/coaches';
import type { CoachDef } from '../data/coaches';
import { useSessionStore } from '../store/sessionStore';
import { useLastSessionStore } from '../store/lastSessionStore';
import { formatTopicLabel } from '../data/coaches';


const recommendedLessons = lessons.slice(0, 3);

function ResumeCard({ coach, topic, timeAgo, onResume }: { coach: CoachDef; topic: string; timeAgo?: string | null; onResume: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: 10, overflow: 'hidden',
        border: '1px solid #e8e8e8',
        cursor: 'pointer', height: '100%', minHeight: 110,
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'transform 0.18s, box-shadow 0.18s',
      }}
      onClick={onResume}
    >
      {/* Coach headshot — fills card */}
      <img
        src={coach.previewUrl}
        alt={coach.name}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center top',
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 0.3s ease',
        }}
      />

      {/* Dark gradient overlay — bottom */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)',
      }} />

      {/* "Last Session" label — top left */}
      <div style={{
        position: 'absolute', top: 9, left: 10,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        borderRadius: 20, padding: '2px 8px',
        fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
        letterSpacing: '0.07em', textTransform: 'uppercase',
      }}>
        {timeAgo ? `Last · ${timeAgo}` : 'Last Session'}
      </div>

      {/* Play button — top right */}
      <button
        onClick={(e) => { e.stopPropagation(); onResume(); }}
        style={{
          position: 'absolute', top: 8, right: 8,
          width: 28, height: 28, borderRadius: '50%',
          background: 'white', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          transition: 'transform 0.15s, background 0.15s',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
          <path d="M1 1.5L9 6L1 10.5V1.5Z" fill="#111" />
        </svg>
      </button>

      {/* Name + topic — bottom */}
      <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'white', lineHeight: 1.2, letterSpacing: '-0.2px' }}>
          {coach.name}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
          {topic}
        </div>
      </div>
    </div>
  );
}

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

  const { skillName } = useSessionStore();
  const { coachId: savedCoachId, topicId: savedTopicId, topicLabel: savedTopicLabel, savedAt } = useLastSessionStore();

  // Prefer persisted last session; fall back to defaults
  const lastCoach = coaches.find(c => c.id === (savedCoachId ?? DEFAULT_COACH_ID)) ?? coaches[0];
  const lastTopicId = savedTopicId ?? 'difficult-conversations';
  const lastTopic = savedTopicLabel
    ? `${savedTopicLabel} · ${savedTopicId ? formatTopicLabel(savedTopicId) : ''}`
    : (skillName || 'Difficult Conversations');

  // Format relative time for the card label
  const sessionAgo = (() => {
    if (!savedAt) return null;
    const diff = Date.now() - new Date(savedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

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
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
  <div>
    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', margin: 0 }}>
      {greeting}, {name || 'there'}
    </h1>
    <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>{date}</p>
  </div>
  <button
    onClick={() => navigate('/coaching')}
    style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
      background: '#111', color: 'white', fontSize: 13, fontWeight: 600,
      marginTop: 4,
    }}
  >▶ Start Session</button>
</div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
      {/* Top row: Resume card + 3 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>

        {/* Resume Session card */}
        <ResumeCard
          coach={lastCoach}
          topic={lastTopic}
          timeAgo={sessionAgo}
          onResume={() => navigate('/coaching', { state: { resume: true, coachId: lastCoach.id, topicId: lastTopicId } })}
        />

        {/* Stat cards */}
        {[
          { label: 'Skills Completed', value: '4', sub: 'of 8 complete', trend: '+2 this month', iconBg: '#e8f5f1', icon: '📈' },
          { label: 'Avg. Eval Score',  value: '81', sub: 'across all evals', trend: '↑ +5 pts',     iconBg: '#eff6ff', icon: '🎯' },
          { label: 'Session Streak',   value: '12', sub: 'days · best: 18', trend: '🔥 Active',     iconBg: '#fff7ed', icon: '⚡' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'white', border: '1px solid #e8e8e8', borderRadius: 10,
            padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 7, background: s.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
              }}>{s.icon}</div>
              <span style={{ fontSize: 11, color: '#17A589', fontWeight: 600 }}>{s.trend}</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#111', marginTop: 10, lineHeight: 1, letterSpacing: '-1px' }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginTop: 6 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
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
