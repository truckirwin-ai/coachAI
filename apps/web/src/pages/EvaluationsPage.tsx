import { useState } from 'react';
import { assessments } from '../data/assessments';
import type { Assessment } from '../data/assessments';
import { lessons } from '../data/lessons';
import { useAssessmentStore } from '../store/assessmentStore';
import { AssessmentView } from '../components/assessments/AssessmentView';
import { PageHeader } from '../components/layout/PageHeader';

// ── Topic-matched cover images (Unsplash) ─────────────────────────────────────
const assessmentImages: Record<string, string> = {
  a1: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=640&q=75', // Leadership — speaker/stage
  a2: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&q=75', // Management — team
  a3: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=640&q=75', // Strategy — chess
  a4: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=640&q=75', // Career — ambition/city
  a5: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=640&q=75', // Influence — handshake
};

function getLessonNames(lessonIds: string[]): string {
  return lessonIds
    .map((id) => lessons.find((l) => l.id === id)?.title ?? id)
    .join(' · ');
}

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = Math.round((score / total) * 100);
  const color = pct >= 80 ? '#17A589' : pct >= 60 ? '#e67e22' : '#e74c3c';
  const bg    = pct >= 80 ? '#e8f5f1' : pct >= 60 ? '#fef3e2' : '#fdecea';
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color,
      background: bg, padding: '3px 9px', borderRadius: 20,
    }}>
      {score}/{total} · {pct}%
    </span>
  );
}

function EvalCard({
  assessment,
  result,
  onStart,
}: {
  assessment: Assessment;
  result?: { score: number; total: number; date: string };
  onStart: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const img = assessmentImages[assessment.id] ?? assessmentImages.a1;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        border: '1px solid #e8e8e8',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.09)' : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        cursor: 'pointer',
      }}
      onClick={onStart}
    >
      {/* Cover image — 16:9 */}
      <div style={{
        position: 'relative',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        background: '#f0f0f0',
      }}>
        <img
          src={img}
          alt={assessment.title}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            display: 'block',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }}
        />

        {/* Completion overlay badge */}
        {result && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            borderRadius: 20, padding: '3px 9px',
            fontSize: 11, fontWeight: 700, color: 'white',
          }}>
            ✓ Completed
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Domain pill + meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{
            background: '#111', color: 'white',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '3px 8px', borderRadius: 20,
            flexShrink: 0,
          }}>
            {assessment.domain}
          </span>
          <span style={{ fontSize: 11, color: '#bbb' }}>
            {assessment.questionCount} questions · ~{assessment.estimatedMins} min
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 15, fontWeight: 800, color: '#111',
          lineHeight: 1.3, marginBottom: 7, letterSpacing: '-0.2px',
        }}>
          {assessment.title}
        </div>

        {/* Description */}
        <p style={{
          fontSize: 12.5, color: '#777', lineHeight: 1.55,
          margin: '0 0 10px', flex: 1,
        }}>
          {assessment.description}
        </p>

        {/* Related lessons */}
        {assessment.relatedLessons?.length > 0 && (
          <div style={{ fontSize: 11, color: '#bbb', marginBottom: 14, lineHeight: 1.4 }}>
            {getLessonNames(assessment.relatedLessons)}
          </div>
        )}

        {/* Footer: score + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          {result
            ? <ScoreBadge score={result.score} total={result.total} />
            : <span style={{ fontSize: 11, color: '#ccc', fontWeight: 500 }}>Not started</span>
          }
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: result ? '#17A589' : '#111',
            letterSpacing: '-0.1px',
          }}>
            {result ? 'Retake →' : 'Start →'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function EvaluationsPage() {
  const results = useAssessmentStore((s) => s.results);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);

  if (activeAssessment) {
    return (
      <AssessmentView
        assessment={activeAssessment}
        onClose={() => setActiveAssessment(null)}
      />
    );
  }

  const completed = assessments.filter(a => results[a.id]);
  const pending   = assessments.filter(a => !results[a.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Evaluations"
        subtitle={`${completed.length} of ${assessments.length} complete`}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>

        {/* Pending */}
        {pending.length > 0 && (
          <>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: '#aaa', marginBottom: 12,
            }}>
              Ready to take
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 14, marginBottom: 28,
            }}>
              {pending.map(a => (
                <EvalCard
                  key={a.id}
                  assessment={a}
                  result={undefined}
                  onStart={() => setActiveAssessment(a)}
                />
              ))}
            </div>
          </>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: '#aaa', marginBottom: 12,
            }}>
              Completed
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 14,
            }}>
              {completed.map(a => (
                <EvalCard
                  key={a.id}
                  assessment={a}
                  result={results[a.id]}
                  onStart={() => setActiveAssessment(a)}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
