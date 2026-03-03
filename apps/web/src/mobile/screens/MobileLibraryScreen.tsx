import { useState } from 'react';
import { lessons } from '../../data/lessons';
import type { Lesson } from '../../data/lessons';
import { MobileLessonPlayer } from '../MobileLessonPlayer';

const domainColor: Record<string, string> = {
  Leadership: '#553C9A',
  Communication: '#17A589',
  Productivity: '#D69E2E',
  Mindfulness: '#2C7BE5',
};

const filters = ['All', 'TED Talks', 'Podcasts', 'Skills'];

export function MobileLibraryScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const filtered = lessons.filter(l => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'TED Talks') return l.format === 'ted-talk';
    if (activeFilter === 'Podcasts') return l.format === 'podcast';
    if (activeFilter === 'Skills') return l.isSkill;
    return true;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 14 }}>Library</div>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12 }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                background: activeFilter === f ? '#17A589' : '#1C1C1E',
                border: 'none', borderRadius: 20,
                padding: '6px 16px', fontSize: 12,
                color: activeFilter === f ? 'white' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer', fontWeight: activeFilter === f ? 700 : 400,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {filtered.map((lesson) => {
          const color = domainColor[lesson.domain] ?? '#17A589';
          return (
            <div key={lesson.id} style={{
              background: '#1C1C1E', borderRadius: 14, marginBottom: 10,
              display: 'flex', alignItems: 'center', overflow: 'hidden',
              borderLeft: `4px solid ${color}`,
            }}>
              <div style={{ flex: 1, padding: '14px 12px' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                    background: '#2C2C2E', color: 'rgba(255,255,255,0.6)',
                    padding: '2px 7px', borderRadius: 6,
                  }}>
                    {lesson.format === 'ted-talk' ? 'TED Talk' : 'Podcast'}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 4 }}>
                  {lesson.title}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                  {lesson.durationMins} min · {lesson.domain}
                </div>
              </div>
              <button
                onClick={() => setActiveLesson(lesson)}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#17A589', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, margin: '0 14px',
                  color: 'white', fontSize: 14,
                }}
              >
                ▶
              </button>
            </div>
          );
        })}
      </div>

      {activeLesson && (
        <MobileLessonPlayer lesson={activeLesson} onClose={() => setActiveLesson(null)} />
      )}
    </div>
  );
}
