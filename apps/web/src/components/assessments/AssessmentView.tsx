import { useState } from 'react';
import type { Assessment, AssessmentQuestion } from '../../data/assessments';
import { useAssessmentStore } from '../../store/assessmentStore';
import { domainColors } from '../../data/mockData';

interface AssessmentViewProps {
  assessment: Assessment;
  onClose: () => void;
}

type Phase = 'question' | 'result' | 'complete';

function StarRating({ score, total }: { score: number; total: number }) {
  const pct = score / total;
  const stars = pct >= 0.9 ? 5 : pct >= 0.75 ? 4 : pct >= 0.6 ? 3 : pct >= 0.4 ? 2 : 1;
  const label = pct >= 0.9 ? 'Excellent mastery' : pct >= 0.75 ? 'Strong understanding' : pct >= 0.6 ? 'Good foundation' : pct >= 0.4 ? 'Developing knowledge' : 'Needs review';
  return (
    <div style={{ textAlign: 'center', margin: '12px 0' }}>
      <div style={{ fontSize: 28, letterSpacing: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: i < stars ? '#F6AD55' : '#E2E8F0' }}>★</span>
        ))}
      </div>
      <div style={{ fontSize: 14, color: '#718096', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export function AssessmentView({ assessment, onClose }: AssessmentViewProps) {
  const setResult = useAssessmentStore((s) => s.setResult);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<Phase>('question');
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});

  const question: AssessmentQuestion = assessment.questions[currentIndex];
  const total = assessment.questions.length;
  const progress = ((currentIndex) / total) * 100;

  const domainColor = domainColors[assessment.domain] || { bg: '#EBF8FF', text: '#2C5282' };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setSubmitted(true);
    setAnswers((prev) => ({ ...prev, [question.id]: selectedOption }));
    setPhase('result');
  };

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      // Compute score
      const finalAnswers = { ...answers, [question.id]: selectedOption! };
      const score = assessment.questions.filter((q) => finalAnswers[q.id] === q.correctAnswer).length;
      setResult(assessment.id, score, total);
      setPhase('complete');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setSubmitted(false);
      setPhase('question');
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setPhase('question');
    setAnswers({});
  };

  const isCorrect = selectedOption === question.correctAnswer;

  // Completion screen
  if (phase === 'complete') {
    const finalAnswers = answers;
    const score = assessment.questions.filter((q) => finalAnswers[q.id] === q.correctAnswer).length;
    const wrongQuestions = assessment.questions.filter((q) => finalAnswers[q.id] !== q.correctAnswer);

    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#fff', zIndex: 1000,
        overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎯</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A202C', margin: '0 0 8px' }}>Assessment Complete!</h1>
            <p style={{ fontSize: 18, color: '#4A5568', margin: 0 }}>
              You scored <strong style={{ color: '#319795' }}>{score}/{total}</strong> ({Math.round((score / total) * 100)}%)
            </p>
          </div>

          <div style={{
            background: domainColor.bg,
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 24,
            textAlign: 'center',
          }}>
            <span style={{
              display: 'inline-block',
              background: domainColor.text,
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
              padding: '3px 10px',
              borderRadius: 4,
              marginBottom: 8,
            }}>{assessment.domain}</span>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1A202C' }}>{assessment.title}</div>
            <StarRating score={score} total={total} />
          </div>

          {wrongQuestions.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A202C', marginBottom: 12 }}>
                Review — {wrongQuestions.length} question{wrongQuestions.length !== 1 ? 's' : ''} to revisit
              </h3>
              {wrongQuestions.map((q) => (
                <div key={q.id} style={{
                  background: '#FFF5F5',
                  border: '1px solid #FED7D7',
                  borderRadius: 8,
                  padding: '14px 16px',
                  marginBottom: 10,
                }}>
                  <div style={{ fontSize: 13, color: '#742A2A', marginBottom: 6 }}>{q.question}</div>
                  <div style={{ fontSize: 13, color: '#276749' }}>
                    ✓ Correct answer: <strong>{q.correctAnswer}. {q.options.find(o => o.id === q.correctAnswer)?.text}</strong>
                  </div>
                  {finalAnswers[q.id] && (
                    <div style={{ fontSize: 13, color: '#C53030', marginTop: 4 }}>
                      ✗ Your answer: {finalAnswers[q.id]}. {q.options.find(o => o.id === finalAnswers[q.id])?.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleRetake}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 8,
                background: '#EDF2F7', border: 'none',
                fontSize: 15, fontWeight: 600, color: '#4A5568', cursor: 'pointer',
              }}
            >
              Retake
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 8,
                background: '#319795', border: 'none',
                fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer',
              }}
            >
              Back to Evaluations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#fff', zIndex: 1000,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, color: '#718096', padding: 4, lineHeight: 1,
          }}
        >✕</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1A202C' }}>{assessment.title}</span>
            <span style={{ fontSize: 13, color: '#718096' }}>{currentIndex + 1}/{total}</span>
          </div>
          <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: '#319795',
              borderRadius: 3,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 13, color: '#A0AEC0', marginBottom: 12 }}>
            Question {currentIndex + 1} of {total}
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1A202C', lineHeight: 1.5, marginBottom: 28 }}>
            {question.question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectOpt = opt.id === question.correctAnswer;
              let bg = '#F7FAFC';
              let border = '1.5px solid #E2E8F0';
              let color = '#2D3748';

              if (submitted) {
                if (isCorrectOpt) {
                  bg = '#F0FFF4'; border = '1.5px solid #68D391'; color = '#276749';
                } else if (isSelected && !isCorrect) {
                  bg = '#FFF5F5'; border = '1.5px solid #FC8181'; color = '#9B2C2C';
                } else {
                  bg = '#F7FAFC'; color = '#A0AEC0';
                }
              } else if (isSelected) {
                bg = '#EBF8FF'; border = '1.5px solid #63B3ED'; color = '#2B6CB0';
              }

              return (
                <button
                  key={opt.id}
                  disabled={submitted}
                  onClick={() => setSelectedOption(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '14px 16px', borderRadius: 10,
                    background: bg, border, color,
                    textAlign: 'left', cursor: submitted ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: 15, lineHeight: 1.5,
                  }}
                >
                  <span style={{
                    minWidth: 28, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    background: isSelected && !submitted ? '#BEE3F8' : submitted && isCorrectOpt ? '#C6F6D5' : submitted && isSelected ? '#FED7D7' : '#E2E8F0',
                    fontSize: 13, fontWeight: 700,
                  }}>
                    {opt.id}
                  </span>
                  <span style={{ paddingTop: 3 }}>{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation panel */}
          {submitted && (
            <div style={{
              borderRadius: 10,
              padding: '16px 18px',
              marginBottom: 24,
              background: isCorrect ? '#F0FFF4' : '#FFFBEB',
              border: `1px solid ${isCorrect ? '#68D391' : '#F6AD55'}`,
            }}>
              <div style={{
                fontSize: 16, fontWeight: 700,
                color: isCorrect ? '#276749' : '#744210',
                marginBottom: 8,
              }}>
                {isCorrect ? '✅ Correct!' : `❌ Incorrect — the correct answer is ${question.correctAnswer}`}
              </div>
              <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.6, margin: 0 }}>
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #E2E8F0',
        background: '#fff',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 10,
                background: selectedOption ? '#319795' : '#E2E8F0',
                border: 'none',
                fontSize: 15, fontWeight: 600,
                color: selectedOption ? '#fff' : '#A0AEC0',
                cursor: selectedOption ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s ease',
              }}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 10,
                background: '#319795', border: 'none',
                fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer',
              }}
            >
              {currentIndex + 1 >= total ? 'View Results →' : 'Next Question →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
