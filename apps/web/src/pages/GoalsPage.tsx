import { useState } from 'react';
import { useGoalsStore } from '../store/goalsStore';
import { useToastStore } from '../store/toastStore';
import { ProgressBar } from '../components/ui/ProgressBar';
import { PageHeader } from '../components/layout/PageHeader';

const mockCommitments = [
  { id: '1', text: 'Have 1:1 with Jordan about performance expectations', status: 'Done', date: 'Feb 28' },
  { id: '2', text: 'Delegate weekly ops review to Sarah for March', status: 'Pending', date: 'Mar 7' },
];

const focusAreas = ['Leadership', 'Management', 'Communication', 'Strategy', 'Career'];

export function GoalsPage() {
  const { goals, addGoal, addReflection } = useGoalsStore();
  const { show } = useToastStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', due: '', focusArea: 'Leadership' });

  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionText, setReflectionText] = useState('');

  const handleAddGoal = () => {
    if (!newGoal.name.trim()) return;
    addGoal({ name: newGoal.name, due: newGoal.due || 'TBD', focusArea: newGoal.focusArea });
    setNewGoal({ name: '', due: '', focusArea: 'Leadership' });
    setShowAddForm(false);
    show('✅ Goal added!');
  };

  const handleSaveReflection = () => {
    if (!reflectionText.trim()) return;
    addReflection(reflectionText);
    setReflectionText('');
    setShowReflectionModal(false);
    show('✅ Reflection saved!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Goals"
        subtitle="Track what you're working toward"
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => setShowReflectionModal(true)}>📝 Record a reflection</button>
            <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>+ Add Goal</button>
          </div>
        }
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
      {/* Add Goal Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--accent)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>New Goal</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Goal Statement</label>
              <input
                type="text"
                value={newGoal.name}
                onChange={e => setNewGoal(g => ({ ...g, name: e.target.value }))}
                placeholder="e.g. Build a high-trust team by Q2"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 7,
                  border: '1.5px solid var(--border)', fontSize: 14,
                  fontFamily: 'inherit', color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Target Date</label>
                <input
                  type="date"
                  value={newGoal.due}
                  onChange={e => setNewGoal(g => ({ ...g, due: e.target.value }))}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 7,
                    border: '1.5px solid var(--border)', fontSize: 14,
                    fontFamily: 'inherit', color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Focus Area</label>
                <select
                  value={newGoal.focusArea}
                  onChange={e => setNewGoal(g => ({ ...g, focusArea: e.target.value }))}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 7,
                    border: '1.5px solid var(--border)', fontSize: 14,
                    fontFamily: 'inherit', color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                    background: 'white',
                  }}
                >
                  {focusAreas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => setShowAddForm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={handleAddGoal}>Save Goal</button>
            </div>
          </div>
        </div>
      )}

      {/* Goals list */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Active Goals</div>
        {goals.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '20px 0' }}>No goals yet. Add one above!</div>
        )}
        {goals.map((g, i) => (
          <div key={g.id} style={{ padding: '14px 0', borderBottom: i < goals.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Target: {g.due}{g.focusArea ? ` · ${g.focusArea}` : ''}</div>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)', flexShrink: 0, marginLeft: 16 }}>{g.pct}%</span>
            </div>
            <ProgressBar value={g.pct} />
          </div>
        ))}
      </div>

      {/* Commitment Log */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Commitment Log</div>
        {mockCommitments.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              background: c.status === 'Done' ? 'var(--success-light)' : 'var(--warning-light)',
            }}>
              {c.status === 'Done' ? '✓' : '⏳'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.text}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{c.date}</div>
            </div>
            <span className="badge" style={{
              background: c.status === 'Done' ? 'var(--success-light)' : 'var(--warning-light)',
              color: c.status === 'Done' ? 'var(--success)' : 'var(--warning)',
            }}>{c.status}</span>
          </div>
        ))}
      </div>

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
