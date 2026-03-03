import { useState } from 'react';
import { assessments } from '../../data/assessments';
import { useAssessmentStore } from '../../store/assessmentStore';

const domainColor: Record<string, string> = {
  Leadership: '#553C9A',
  Communication: '#17A589',
  Productivity: '#D69E2E',
  Mindfulness: '#2C7BE5',
};

export function MobileEvalsScreen() {
  const { results } = useAssessmentStore();
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (activeAssessment) {
    const assessment = assessments.find(a => a.id === activeAssessment);
    if (!assessment) return null;
    const q = assessment.questions[questionIdx];
    const answered = answers[q.id];

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <div style={{ padding: '16px', borderBottom: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={() => { setActiveAssessment(null); setQuestionIdx(0); setAnswers({}); }} style={{ background: 'none', border: 'none', color: '#17A589', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
            ← Back
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{assessment.title}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{questionIdx + 1} of {assessment.questions.length}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: '#1C1C1E', flexShrink: 0 }}>
          <div style={{ height: '100%', background: '#17A589', width: `${((questionIdx + 1) / assessment.questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1.5, marginBottom: 20 }}>
            {q.question}
          </div>

          {q.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => setAnswers(a => ({ ...a, [q.id]: opt.id }))}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: answered === opt.id ? 'rgba(23,165,137,0.15)' : '#1C1C1E',
                border: `1.5px solid ${answered === opt.id ? '#17A589' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12, padding: '13px 14px', marginBottom: 10,
                fontSize: 13, color: 'white', cursor: 'pointer', lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 700, color: '#17A589', marginRight: 8 }}>{opt.id}.</span>
              {opt.text}
            </button>
          ))}

          {answered && questionIdx < assessment.questions.length - 1 && (
            <button
              onClick={() => setQuestionIdx(i => i + 1)}
              style={{
                width: '100%', background: '#17A589', color: 'white', border: 'none',
                borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8,
              }}
            >
              Next →
            </button>
          )}
          {answered && questionIdx === assessment.questions.length - 1 && (
            <button
              onClick={() => { setActiveAssessment(null); setQuestionIdx(0); setAnswers({}); }}
              style={{
                width: '100%', background: '#17A589', color: 'white', border: 'none',
                borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8,
              }}
            >
              Finish ✓
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
      <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 16 }}>Evaluations</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {assessments.map(a => {
          const color = domainColor[a.domain] ?? '#17A589';
          const result = results?.[a.id];
          const score = result?.score;
          return (
            <div key={a.id} style={{
              background: '#1C1C1E', borderRadius: 14, marginBottom: 10,
              borderLeft: `4px solid ${color}`, overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 4 }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                      {a.questionCount} questions · ~{a.estimatedMins} min · {a.domain}
                    </div>
                  </div>
                  {score !== undefined && (
                    <span style={{
                      background: score >= 80 ? 'rgba(23,165,137,0.2)' : 'rgba(214,158,46,0.2)',
                      color: score >= 80 ? '#17A589' : '#D69E2E',
                      fontSize: 13, fontWeight: 800, padding: '4px 10px', borderRadius: 8,
                      flexShrink: 0, marginLeft: 8,
                    }}>
                      {score}%
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setActiveAssessment(a.id); setQuestionIdx(0); setAnswers({}); }}
                  style={{
                    background: '#17A589', color: 'white', border: 'none', borderRadius: 10,
                    padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {score !== undefined ? 'Retake →' : 'Start →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
