// © 2026 Foundry SMB LLC. All rights reserved.
// CoachAI — ProgressPage

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockRubric, mockGoals } from '../data/mockData';
import { useSessionStore } from '../store/sessionStore';
import { PageHeader } from '../components/layout/PageHeader';

const skillsData = [
  { icon: '🌱', name: 'Transparent Communication', domain: 'Communication', score: 85, status: 'done' as const },
  { icon: '🤝', name: 'Delegation & Trust', domain: 'Management', score: 88, status: 'done' as const },
  { icon: '👥', name: 'Managing Up Effectively', domain: 'Career', score: 74, status: 'done' as const },
  { icon: '🏆', name: 'Setting Clear Expectations', domain: 'Leadership', score: 78, status: 'done' as const },
  { icon: '💬', name: 'Difficult Conversations', domain: 'Leadership', label: 'Week 2/4', status: 'inprogress' as const },
  { icon: '🚀', name: 'Leadership Presence', domain: 'Leadership', label: 'Up next', status: 'upcoming' as const },
];

type SkillData = typeof skillsData[number];

const scoreColor = (score: number) => score >= 85 ? '#38A169' : '#D69E2E';

const iconBg: Record<string, string> = {
  '🌱': '#D1FAE5', '🤝': '#DBEAFE', '👥': '#EDE9FE',
  '🏆': '#FEF3C7', '💬': '#FCE7F3', '🚀': '#E0F2FE',
};

const statusTag = (status: string) => {
  if (status === 'done') return { label: '✓ Done', color: '#38A169', bg: '#F0FFF4', border: '#B7E4C7' };
  if (status === 'inprogress') return { label: 'In Progress', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' };
  return { label: 'Upcoming', color: '#9CA3AF', bg: '#F3F4F6', border: '#E5E7EB' };
};

const progressPct = (status: string) => status === 'done' ? 100 : status === 'inprogress' ? 50 : 0;

// Evaluation details per skill (mocked)
const skillEvals: Record<string, { title: string; date: string; scenario: string; score: number; prev: number; feedback: string }> = {
  'Delegation & Trust': {
    title: 'Delegation & Trust — Evaluation',
    date: 'Completed Feb 26, 2026',
    scenario: '"Delegating the quarterly report to a first-time lead"',
    score: 88, prev: 76,
    feedback: 'You showed real growth in how clearly you set up the task — your framing of success criteria was specific and measurable, which made the delegation feel empowering rather than ambiguous. Where you can go deeper: the moment Alex pushed back on the deadline, you reverted to checking in daily rather than coaching him to solve it. That\'s a subtle form of taking back control. Next cycle, notice when concern becomes hovering — the goal is confidence transfer, not comfort management.',
  },
  'Transparent Communication': {
    title: 'Transparent Communication — Evaluation',
    date: 'Completed Jan 14, 2026',
    scenario: '"Sharing bad news with the team about the delayed product launch"',
    score: 85, prev: 72,
    feedback: 'You\'ve made significant strides in being more direct with your team. Your framing of the delay was honest without being alarmist. Continue building on your ability to invite questions — the more you normalize hard conversations, the safer the team will feel to surface problems early.',
  },
};

export function ProgressPage() {
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState<SkillData>(skillsData[1]);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const navigate = useNavigate();
  const { setSkill } = useSessionStore();

  const evalDetail = skillEvals[selectedSkill.name];

  const historyBars = [
    { label: 'Oct', value: 62, current: false },
    { label: 'Nov', value: 68, current: false },
    { label: 'Jan', value: 76, current: false },
    { label: 'Feb', value: 88, current: true },
  ];
  const maxBar = 88;

  const handleStartSkill = (skill: SkillData) => {
    setSkill(skill.name, skill.domain);
    navigate('/session');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="Progress" subtitle="Your coaching journey at a glance" />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* LEFT PANEL */}
      <div style={{ width: 340, minWidth: 340, padding: 14, overflowY: 'auto', borderRight: '1px solid #E5E7EB', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>Leadership Track · 4 of 8 complete</div>
          </div>
          <select
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value)}
            style={{ fontSize: 11, border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 6px', color: 'var(--text-2)', background: '#fff', cursor: 'pointer' }}
          >
            <option value="all">All time</option>
            <option value="3m">Last 3 months</option>
          </select>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Overall Program Progress</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#17A589' }}>50%</span>
          </div>
          <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '50%', background: '#17A589', borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>4 skills complete · 1 in progress · 3 upcoming</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {skillsData.map((s: SkillData, i: number) => {
            const tag = statusTag(s.status);
            const pct = progressPct(s.status);
            const isSelected = selectedSkill.name === s.name;
            const score = (s as any).score as number | undefined;
            const label = (s as any).label as string | undefined;
            return (
              <div
                key={i}
                onClick={() => setSelectedSkill(s)}
                style={{
                  background: '#fff',
                  border: isSelected ? '2px solid #1B3A5C' : '1px solid #E5E7EB',
                  borderRadius: 10,
                  padding: '12px 10px 0 10px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'border-color .15s, box-shadow .15s',
                  boxShadow: isSelected ? '0 2px 12px rgba(27,58,92,0.12)' : 'none',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#93C5FD'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#E5E7EB'; }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 7, background: iconBg[s.icon] || '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, marginBottom: 8,
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>{s.domain}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: score != null ? scoreColor(score) : '#6B7280', marginBottom: 6, lineHeight: 1 }}>
                  {score != null ? score : label}
                </div>
                <div style={{
                  display: 'inline-block', fontSize: 10, fontWeight: 700,
                  color: tag.color, background: tag.bg, border: `1px solid ${tag.border}`,
                  borderRadius: 4, padding: '2px 6px', marginBottom: s.status === 'upcoming' ? 4 : 8,
                }}>
                  {tag.label}
                </div>
                {s.status === 'upcoming' && (
                  <div style={{ marginBottom: 8 }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleStartSkill(s); }}
                      style={{
                        fontSize: 10, fontWeight: 700, color: '#1B3A5C',
                        background: '#EFF6FF', border: '1px solid #BFDBFE',
                        borderRadius: 4, padding: '3px 8px', cursor: 'pointer',
                      }}
                    >Start Skill →</button>
                  </div>
                )}
                <div style={{ height: 3, background: '#F3F4F6', margin: '0 -10px' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#38A169' : '#17A589' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER PANEL */}
      <div style={{ flex: 1, padding: 14, overflowY: 'auto', borderLeft: '1px solid #E5E7EB', background: '#fff' }}>
        {evalDetail ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text)' }}>{evalDetail.title}</h3>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
                {evalDetail.date} · Scenario: {evalDetail.scenario}
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: '#F0FFF4', border: '1px solid #B7E4C7',
              borderRadius: 10, padding: '16px 18px', marginBottom: 22,
            }}>
              <div>
                <div style={{ fontSize: 44, fontWeight: 900, color: '#38A169', lineHeight: 1 }}>{evalDetail.score}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Overall Score</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Strong Performance</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Previous: {evalDetail.prev} (+{evalDetail.score - evalDetail.prev} improvement)</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div style={{ background: '#C6F6D5', color: '#276749', fontSize: 13, fontWeight: 800, padding: '5px 12px', borderRadius: 7 }}>▲ +{evalDetail.score - evalDetail.prev}</div>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Rubric Breakdown</div>
              {mockRubric.map((r, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.score >= 85 ? '#38A169' : '#D69E2E' }}>{r.score}/100</span>
                  </div>
                  <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${r.score}%`, background: r.score >= 85 ? '#38A169' : '#D69E2E', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>🤖 AI Coach Feedback</div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>{evalDetail.feedback}</p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Score History — {selectedSkill.name}</div>
                <div style={{ fontSize: 11, color: '#38A169', fontWeight: 700 }}>+26 over 4 months</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 80 }}>
                {historyBars.map((b, i) => (
                  <div
                    key={i}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end', position: 'relative' }}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {hoveredBar === i && (
                      <div style={{
                        position: 'absolute', top: 0, background: '#1B3A5C', color: 'white',
                        fontSize: 11, fontWeight: 700, padding: '3px 7px', borderRadius: 5,
                        whiteSpace: 'nowrap', zIndex: 10,
                      }}>Score: {b.value}</div>
                    )}
                    <div style={{ fontSize: 10, fontWeight: 700, color: b.current ? '#17A589' : 'var(--text-3)' }}>{b.value}</div>
                    <div style={{
                      width: '100%', background: b.current ? '#17A589' : hoveredBar === i ? '#93C5FD' : '#D1D5DB',
                      borderRadius: '4px 4px 0 0',
                      height: `${(b.value / maxBar) * 60}px`,
                      transition: 'background .15s',
                      cursor: 'default',
                    }} />
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 16 }}>
            <div style={{ fontSize: 48 }}>{selectedSkill.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{selectedSkill.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{selectedSkill.status === 'upcoming' ? 'Not started yet' : 'In progress — Week 2 of 4'}</div>
            <button
              onClick={() => handleStartSkill(selectedSkill)}
              className="btn btn-primary"
              style={{ marginTop: 8 }}
            >Start Skill →</button>
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: 200, minWidth: 200, padding: '12px 10px', borderLeft: '1px solid #E5E7EB', background: '#FAFBFC', overflowY: 'auto' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>🎯 Active Goals</div>
        {mockGoals.map((g, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 6, lineHeight: 1.3 }}>{g.name}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1B3A5C', marginBottom: 6 }}>{g.pct}%</div>
            <div style={{ height: 5, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${g.pct}%`, background: '#17A589', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Due {g.due}</div>
          </div>
        ))}

        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 14, marginTop: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>📌 Commitments</div>

          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Stated Feb 27</div>
            <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 8 }}>
              "I'll have the Jordan conversation before end of this week."
            </div>
            <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 4, padding: '2px 7px' }}>
              ⏳ Pending
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Stated Feb 20</div>
            <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 8 }}>
              "Stop joining the daily standup. Let Maya run it."
            </div>
            <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, color: '#276749', background: '#F0FFF4', border: '1px solid #B7E4C7', borderRadius: 4, padding: '2px 7px' }}>
              ✓ Done
            </div>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
