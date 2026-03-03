import { useState } from 'react';
import { assessments } from '../data/assessments';
import type { Assessment } from '../data/assessments';
import { lessons } from '../data/lessons';
import { domainColors } from '../data/mockData';
import { useAssessmentStore } from '../store/assessmentStore';
import { AssessmentView } from '../components/assessments/AssessmentView';
import { PageHeader } from '../components/layout/PageHeader';

function getLessonNames(lessonIds: string[]): string {
  return lessonIds
    .map((id) => lessons.find((l) => l.id === id)?.title ?? id)
    .join(', ');
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="Evaluations" subtitle="Test your knowledge across 5 topic areas" />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: 20,
      }}>
        {assessments.map((assessment) => {
          const dc = domainColors[assessment.domain] || { bg: '#EBF8FF', text: '#2C5282' };
          const result = results[assessment.id];

          return (
            <div
              key={assessment.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                borderLeft: `4px solid ${dc.text}`,
                padding: '20px 20px 20px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              {/* Domain badge */}
              <div style={{ marginBottom: 10 }}>
                <span style={{
                  display: 'inline-block',
                  background: dc.bg,
                  color: dc.text,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: 4,
                }}>
                  {assessment.domain}
                </span>
              </div>

              {/* Title */}
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A202C', margin: '0 0 6px' }}>
                {assessment.title}
              </h2>

              {/* Description */}
              <p style={{ fontSize: 13.5, color: '#718096', lineHeight: 1.5, margin: '0 0 12px' }}>
                {assessment.description}
              </p>

              {/* Meta */}
              <div style={{ fontSize: 13, color: '#A0AEC0', marginBottom: 8 }}>
                {assessment.questionCount} questions · ~{assessment.estimatedMins} min
              </div>

              {/* Related lessons */}
              <div style={{ fontSize: 12, color: '#B0BAC7', marginBottom: 16, lineHeight: 1.4 }}>
                Related: {getLessonNames(assessment.relatedLessons)}
              </div>

              {/* Progress + Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                {result ? (
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: '#319795',
                  }}>
                    {result.score}/{result.total} ✓ · {result.date}
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: '#CBD5E0' }}>Not started</span>
                )}

                <button
                  onClick={() => setActiveAssessment(assessment)}
                  style={{
                    background: '#319795',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '9px 16px',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {result ? 'Retake →' : 'Start Assessment →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
