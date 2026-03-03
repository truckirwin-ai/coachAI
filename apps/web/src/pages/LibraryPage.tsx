import { useState } from 'react';
import { lessons } from '../data/lessons';
import type { Lesson, LessonFormat } from '../data/lessons';
import { LessonPlayer } from '../components/lessons/LessonPlayer';
import { PageHeader } from '../components/layout/PageHeader';

const domainColors: Record<string, string> = {
  Leadership: '#1B3A5C',
  Communication: '#17A589',
  Career: '#8E44AD',
  Management: '#E67E22',
  Strategy: '#2980B9',
  Influence: '#C0392B',
};

function getInitials(name: string) {
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
}

type ContentFilter = 'all' | LessonFormat | 'skill';

const ALL_DOMAINS = ['All', 'Leadership', 'Management', 'Communication', 'Strategy', 'Career', 'Influence'];

function LessonCard({ lesson, onPlay }: { lesson: Lesson; onPlay: () => void }) {
  const domainColor = domainColors[lesson.domain] || '#1B3A5C';
  const isTedTalk = lesson.format === 'ted-talk';
  const isSkill = lesson.isSkill === true;

  if (isTedTalk) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        display: 'flex',
        transition: 'box-shadow 0.15s',
      }}>
        {/* Left color bar */}
        <div style={{ width: 4, background: domainColor, flexShrink: 0 }} />
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Badges row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{
              background: '#1B3A5C', color: 'white',
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
            }}>🎤 TED Talk</span>
            {isSkill && (
              <span style={{
                background: '#17A589', color: 'white',
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
              }}>⚡ Skill</span>
            )}
            <span style={{
              background: domainColor + '20', color: domainColor,
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            }}>{lesson.domain}</span>
          </div>

          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6, lineHeight: 1.3 }}>
            {lesson.title}
          </div>

          <div style={{
            fontSize: 12.5, color: '#666', marginBottom: 10, lineHeight: 1.5, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          } as React.CSSProperties}>
            {lesson.description}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#999' }}>
              ⏱ {isSkill ? `~${lesson.durationMins} min` : `${lesson.durationMins} min`}
            </span>
            {lesson.chapters && (
              <span style={{ fontSize: 11, color: '#999' }}>📑 {lesson.chapters.length} chapters</span>
            )}
            {lesson.skillLinks.map((s: string) => (
              <span key={s} style={{
                fontSize: 10, background: '#f0f0f0', color: '#555',
                padding: '2px 7px', borderRadius: 10,
              }}>{s}</span>
            ))}
          </div>

          <button onClick={onPlay} style={{
            background: '#17A589', color: 'white',
            border: 'none', borderRadius: 7,
            padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            alignSelf: 'flex-start',
          }}>▶ Listen</button>
        </div>
      </div>
    );
  }

  // Podcast card
  return (
    <div style={{
      background: 'white', borderRadius: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: '16px', display: 'flex', flexDirection: 'column',
    }}>
      {/* Format + domain badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          background: '#6C3483', color: 'white',
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
        }}>🎙 Podcast</span>
        <span style={{
          background: (domainColors[lesson.domain] || '#999') + '20',
          color: domainColors[lesson.domain] || '#999',
          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
        }}>{lesson.domain}</span>
      </div>

      {/* Host avatars */}
      {lesson.hosts && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          {lesson.hosts.map((host, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: host.gender === 'male' ? '#1B3A5C' : '#17A589',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 13,
              }}>{getInitials(host.name)}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{host.name}</div>
                <div style={{ fontSize: 10, color: '#999' }}>{host.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6, lineHeight: 1.3 }}>
        {lesson.title}
      </div>

      <div style={{
        fontSize: 12.5, color: '#666', marginBottom: 10, lineHeight: 1.5, flex: 1,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      } as React.CSSProperties}>
        {lesson.description}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontSize: 11, color: '#999' }}>⏱ {lesson.durationMins} min</span>
        <button onClick={onPlay} style={{
          background: '#17A589', color: 'white',
          border: 'none', borderRadius: 7,
          padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>▶ Listen</button>
      </div>
    </div>
  );
}

export function LibraryPage() {
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
  const [domainFilter, setDomainFilter] = useState('All');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const filtered = lessons.filter(l => {
    if (contentFilter === 'ted-talk' && l.format !== 'ted-talk') return false;
    if (contentFilter === 'podcast' && l.format !== 'podcast') return false;
    if (contentFilter === 'skill' && !l.isSkill) return false;
    if (domainFilter !== 'All' && l.domain !== domainFilter) return false;
    return true;
  });

  const contentFilters: { key: ContentFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'ted-talk', label: '🎤 TED Talks' },
    { key: 'podcast', label: '🎙 Podcasts' },
    { key: 'skill', label: '⚡ Skills' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="Library" subtitle="26 talks, conversations, and skill lessons" />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {/* Content type filter */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#999', fontWeight: 600, minWidth: 54 }}>Type:</span>
          {contentFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setContentFilter(f.key)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: '1.5px solid',
                borderColor: contentFilter === f.key ? '#17A589' : '#ddd',
                background: contentFilter === f.key ? '#17A589' : 'white',
                color: contentFilter === f.key ? 'white' : '#555',
                cursor: 'pointer',
                transition: 'all .12s',
              }}
            >{f.label}</button>
          ))}
        </div>

        {/* Domain filter */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#999', fontWeight: 600, minWidth: 54 }}>Domain:</span>
          {ALL_DOMAINS.map(d => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: '1.5px solid',
                borderColor: domainFilter === d ? (domainColors[d] || '#17A589') : '#ddd',
                background: domainFilter === d ? (domainColors[d] || '#17A589') : 'white',
                color: domainFilter === d ? 'white' : '#555',
                cursor: 'pointer',
                transition: 'all .12s',
              }}
            >{d}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '60px 0', fontSize: 14 }}>
          No content matches your filters.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }}>
          {filtered.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onPlay={() => setActiveLesson(lesson)}
            />
          ))}
        </div>
      )}

      {/* Player modal */}
      {activeLesson && (
        <LessonPlayer lesson={activeLesson} onClose={() => setActiveLesson(null)} />
      )}
      </div>
    </div>
  );
}
