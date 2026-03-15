// © 2026 Foundry SMB LLC. All rights reserved.
// CoachAI — LibraryPage


import { useState } from 'react';
import { lessons } from '../data/lessons';
import type { Lesson, LessonFormat } from '../data/lessons';
import { LessonPlayer } from '../components/lessons/LessonPlayer';
import { getCoach } from '../data/coaches';
import type { CoachDef } from '../data/coaches';
import { AvatarLessonPlayer } from '../components/lessons/AvatarLessonPlayer';

const AVATAR_LESSON_COACHES: Record<string, CoachDef> = {
  l1: getCoach('frank'),
  l2: getCoach('carol'),
  l5: getCoach('linda'),
};

// ── Per-lesson cover images (topic-matched Unsplash) ──────────────────────────
const lessonImages: Record<string, string> = {
  // Leadership / Difficult Conversations — two people in serious exchange
  l1:  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=640&q=75',
  // Radical Candor / Feedback — direct eye contact, conversation
  l2:  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640&q=75',
  // Managing Up — looking up at a glass tower
  l3:  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&q=75',
  // Delegation — handing off, relay baton
  l4:  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=640&q=75',
  // Executive Presence — speaker at podium, stage light
  l5:  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=640&q=75',
  // Strategy vs Tactics — chess board
  l6:  'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=640&q=75',
  // First 90 Days — walking into new building, fresh start
  l7:  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=640&q=75',
  // Presentations — microphone, TED-style stage
  l8:  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=640&q=75',
  // Persuasion / Influence — handshake, deal
  l9:  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=640&q=75',
  // Psychological Safety — open team circle, candid discussion
  l10: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&q=75',
  // Meetings — clean conference room, whiteboard
  l11: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=640&q=75',
  // Negotiation — two parties at a table
  l12: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=640&q=75',
  // Feedback Loop — data/analytics chart
  l13: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&q=75',
  // Burnout — person staring out window, depleted
  l14: 'https://images.unsplash.com/photo-1495592822108-9e6261896da8?w=640&q=75',
  // Pivot / Strategic Agility — crossroads, direction
  l15: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=640&q=75',
  // Hiring — interview across a table
  l16: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=640&q=75',
  // Leading Through Uncertainty — foggy mountain road
  l17: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=640&q=75',
  // Getting Promoted — upward ambition, city skyline
  l18: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=640&q=75',
  // Resistance to Change — tug of war, pushback
  l19: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=640&q=75',
  // Decision Fatigue — deep focus, concentration
  l20: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=640&q=75',
  // Emotional Intelligence — thoughtful, reflective
  l21: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&q=75',
  // Performance Review — document review, manager meeting
  l22: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=640&q=75',
  // Intellectual Humility / Don't Know — open hands, curious
  l23: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=640&q=75',
  // Cross-functional Influence — connected network, bridge
  l24: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=640&q=75',
  // Remote Leadership — laptop, video grid
  l25: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=640&q=75',
  // IC to Manager transition — team handoff, group
  l26: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=640&q=75',
};
const fallbackImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&q=75';

// ── Speaker avatars for 6 featured lessons ───────────────────────────────────
const lessonSpeakers: Record<string, { name: string; title: string; avatar: string }> = {
  l1: {
    name: 'Frank Donovan',
    title: 'Executive Leadership',
    avatar: 'https://files2.heygen.ai/avatar/v3/e20ac0c902184ff793e75ae4e139b7dc_45600/preview_target.webp',
  },
  l2: {
    name: 'Carol Reeves',
    title: 'Resilience & Wellbeing',
    avatar: 'https://files2.heygen.ai/avatar/v3/75e0a87b7fd94f0981ff398b593dd47f_45570/preview_talk_4.webp',
  },
  l4: {
    name: 'Denise Carter',
    title: 'People & HR Strategy',
    avatar: 'https://files2.heygen.ai/avatar/v3/68fbd9f64a4948baa3c295d35f49b61c_45630/preview_target.webp',
  },
  l5: {
    name: 'Linda Zhao',
    title: 'Strategy & Career',
    avatar: 'https://files2.heygen.ai/avatar/v3/89e07b826f1c4cb1a5549201cdd8f4d6_55300/preview_target.webp',
  },
  l6: {
    name: 'Damon Hayes',
    title: 'Sales & Revenue Growth',
    avatar: 'https://files2.heygen.ai/avatar/v3/db2fb7fd0d044b908395a011166ab22d_45680/preview_target.webp',
  },
  l9: {
    name: 'Nora Ishikawa',
    title: 'Tech Leadership',
    avatar: 'https://files2.heygen.ai/avatar/v3/2b901b6b72c4444d81a93a2eb8fe1070_55420/preview_target.webp',
  },
};

// ── Badge colours per format ──────────────────────────────────────────────────
const formatLabel: Record<LessonFormat, string> = {
  'ted-talk': '🎤 TED Talk',
  'podcast':  '🎙 Podcast',
};

type ContentFilter = 'all' | LessonFormat | 'skill';
const ALL_DOMAINS = ['All', 'Leadership', 'Management', 'Communication', 'Strategy', 'Career', 'Influence'];

// ── Card ──────────────────────────────────────────────────────────────────────
function LessonCard({
  lesson,
  onPlay,
  onWatch,
  featured = false,
}: {
  lesson: Lesson;
  onPlay: () => void;
  onWatch?: () => void;
  featured?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const img = lessonImages[lesson.id] || fallbackImage;
  const speaker = lessonSpeakers[lesson.id];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        background: 'white',
        border: '1px solid #e8e8e8',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cover image */}
      <div style={{
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        background: '#f0f0f0',
        position: 'relative',
      }}>
        <img
          src={img}
          alt={lesson.title}
          loading="lazy"
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.35s ease',
          }}
        />
        {/* Format overlay badge */}
        <span style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
          color: 'white', fontSize: 10, fontWeight: 700,
          padding: '3px 9px', borderRadius: 20,
          letterSpacing: '0.03em',
        }}>
          {formatLabel[lesson.format]}
        </span>
        {lesson.isSkill && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            background: '#17A589', color: 'white',
            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
          }}>⚡ Skill</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: featured ? '16px 18px 18px' : '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Domain + duration row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{
            background: '#111', color: 'white',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            padding: '3px 10px', borderRadius: 20,
          }}>{lesson.domain.toUpperCase()}</span>
          <span style={{ fontSize: 11, color: '#999', fontWeight: 500 }}>
            ⏱ {lesson.durationMins} min
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: featured ? 17 : 15,
          fontWeight: 700, color: '#111',
          lineHeight: 1.3, marginBottom: 8,
        }}>
          {lesson.title}
        </div>

        {/* Description */}
        <div style={{
          fontSize: 12.5, color: '#777', lineHeight: 1.55, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', marginBottom: 16,
        } as React.CSSProperties}>
          {lesson.description}
        </div>

        {/* Speaker avatar (6 lessons) */}
        {speaker && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <img
              src={speaker.avatar}
              alt={speaker.name}
              style={{
                width: 26, height: 26, borderRadius: '50%',
                objectFit: 'cover', objectPosition: 'center top',
                border: '1.5px solid #e8e8e8', flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#333', lineHeight: 1.2 }}>{speaker.name}</div>
              <div style={{ fontSize: 10, color: '#aaa', lineHeight: 1.2 }}>{speaker.title}</div>
            </div>
          </div>
        )}

        {/* Footer: skill links + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {lesson.skillLinks.slice(0, 2).map(s => (
              <span key={s} style={{
                fontSize: 10, background: '#f3f3f3', color: '#555',
                padding: '2px 8px', borderRadius: 20, border: '1px solid #e8e8e8',
              }}>{s}</span>
            ))}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            {onWatch && (
                <button
                onClick={(e) => { e.stopPropagation(); onWatch(); }}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700, color: '#17A589',
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 0', flexShrink: 0,
                    textDecoration: 'none',
                }}
                >
                🎥 Watch <span style={{ fontSize: 15 }}>→</span>
                </button>
            )}
            <button
                onClick={(e) => { e.stopPropagation(); onPlay(); }}
                style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, color: '#111',
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 0', flexShrink: 0,
                textDecoration: 'none',
                }}
            >
                Listen <span style={{ fontSize: 15 }}>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function LibraryPage() {
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
  const [domainFilter, setDomainFilter] = useState('All');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [avatarLesson, setAvatarLesson] = useState<{ lesson: Lesson; coach: CoachDef } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');

  // Featured: first 3 TED talks
  const featured = lessons.filter(l => l.format === 'ted-talk').slice(0, 3);

  const filtered = lessons.filter(l => {
    // Content Type Filter
    if (contentFilter === 'ted-talk' && l.format !== 'ted-talk') return false;
    if (contentFilter === 'podcast' && l.format !== 'podcast') return false;
    if (contentFilter === 'skill' && !l.isSkill) return false;
    
    // Domain Filter
    if (domainFilter !== 'All' && l.domain !== domainFilter) return false;
    
    // Duration Filter
    if (durationFilter === 'short' && l.durationMins >= 10) return false;
    if (durationFilter === 'medium' && (l.durationMins < 10 || l.durationMins > 15)) return false;
    if (durationFilter === 'long' && l.durationMins <= 15) return false;
    
    // Search Query Filter
    const query = searchQuery.toLowerCase();
    if (query) {
        const searchableText = [
            l.title,
            l.description,
            ...l.skillLinks,
        ].join(' ').toLowerCase();
        if (!searchableText.includes(query)) return false;
    }

    return true;
  });

  const contentFilters: { key: ContentFilter; label: string }[] = [
    { key: 'all',      label: 'All' },
    { key: 'ted-talk', label: '🎤 TED Talks' },
    { key: 'podcast',  label: '🎙 Podcasts' },
    { key: 'skill',    label: '⚡ Skills' },
  ];

  const durationFilters: { key: 'all' | 'short' | 'medium' | 'long'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'short', label: 'Short (<10 min)' },
    { key: 'medium', label: 'Medium (10–15 min)' },
    { key: 'long', label: 'Long (>15 min)' },
  ];

  return (
    <div style={{ background: '#f7f7f5', minHeight: '100%', height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px 32px' }}>

        {/* ── Page header ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#111', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Discover Content
          </h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>
            Talks, podcasts, and skill lessons curated for leaders
          </p>
        </div>

        {/* ── Featured section ─────────────────────────────────────── */}
        <div style={{
          background: 'white', borderRadius: 16,
          border: '1px solid #e8e8e8',
          padding: '16px 20px',
          marginBottom: 32,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>
                Featured
              </h2>
              <p style={{ fontSize: 13, color: '#999', margin: 0 }}>
                Top-rated talks to sharpen your edge
              </p>
            </div>
            <button
              onClick={() => { setContentFilter('ted-talk'); setDomainFilter('All'); }}
              style={{
                background: 'none', border: '1.5px solid #ddd', borderRadius: 8,
                padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#555',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                transition: 'border-color 0.15s',
              }}
            >
              View All <span style={{ fontSize: 14 }}>→</span>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {featured.map(l => (
              <LessonCard 
                key={l.id} 
                lesson={l} 
                onPlay={() => setActiveLesson(l)}
                onWatch={AVATAR_LESSON_COACHES[l.id] ? () => setAvatarLesson({ lesson: l, coach: AVATAR_LESSON_COACHES[l.id] }) : undefined}
                featured 
              />
            ))}
          </div>
        </div>
        
        {/* ── Filters ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
            {/* Search Box */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 18 }}>🔍</span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search talks, topics, skills..."
                    style={{
                        width: '100%',
                        padding: '12px 20px 12px 40px',
                        fontSize: 14,
                        borderRadius: 10,
                        border: '1px solid #ddd',
                        background: 'white',
                        boxSizing: 'border-box',
                    }}
                />
            </div>
            {/* Content type tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, borderBottom: '2px solid #eee', paddingBottom: 0 }}>
                {contentFilters.map(f => (
                <button
                    key={f.key}
                    onClick={() => setContentFilter(f.key)}
                    style={{
                    background: 'none', border: 'none',
                    padding: '8px 16px',
                    fontSize: 13, fontWeight: contentFilter === f.key ? 700 : 500,
                    color: contentFilter === f.key ? '#111' : '#999',
                    cursor: 'pointer',
                    borderBottom: `2px solid ${contentFilter === f.key ? '#111' : 'transparent'}`,
                    marginBottom: -2,
                    transition: 'color 0.15s, border-color 0.15s',
                    }}
                >{f.label}</button>
                ))}
            </div>

            {/* Domain pills */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
                {ALL_DOMAINS.map(d => (
                <button
                    key={d}
                    onClick={() => setDomainFilter(d)}
                    style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    border: '1.5px solid',
                    borderColor: domainFilter === d ? '#111' : '#ddd',
                    background: domainFilter === d ? '#111' : 'white',
                    color: domainFilter === d ? 'white' : '#666',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                    }}
                >{d}</button>
                ))}
            </div>

            {/* Duration pills */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {durationFilters.map(f => (
                <button
                    key={f.key}
                    onClick={() => setDurationFilter(f.key)}
                    style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    border: '1.5px solid',
                    borderColor: durationFilter === f.key ? '#111' : '#ddd',
                    background: durationFilter === f.key ? '#111' : 'white',
                    color: durationFilter === f.key ? 'white' : '#666',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                    }}
                >{f.label}</button>
                ))}
            </div>
        </div>


        {/* ── All content grid ─────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', color: '#aaa', padding: '80px 0',
            fontSize: 14, background: 'white', borderRadius: 14, border: '1px solid #eee',
          }}>
            No content matches your filters.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}>
            {filtered.map(l => (
              <LessonCard 
                key={l.id} 
                lesson={l} 
                onPlay={() => setActiveLesson(l)}
                onWatch={AVATAR_LESSON_COACHES[l.id] ? () => setAvatarLesson({ lesson: l, coach: AVATAR_LESSON_COACHES[l.id] }) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Player modal */}
      {activeLesson && (
        <LessonPlayer lesson={activeLesson} onClose={() => setActiveLesson(null)} />
      )}
      
      {/* Avatar Player modal */}
      {avatarLesson && (
        <AvatarLessonPlayer
            lesson={avatarLesson.lesson}
            coach={avatarLesson.coach}
            onClose={() => setAvatarLesson(null)}
        />
      )}
    </div>
  );
}
