import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { skills } from '../data/mockData';
import { DomainBadge } from '../components/ui/Badge';
import { useSessionStore } from '../store/sessionStore';

const domains = ['All', 'Leadership', 'Management', 'Communication', 'Strategy', 'Career'];

export function SkillsPage() {
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();
  const { setSkill } = useSessionStore();
  const filtered = filter === 'All' ? skills : skills.filter(s => s.domain === filter);

  const startSkill = (skill: typeof skills[number]) => {
    setSkill(skill.name, skill.domain);
    navigate('/session');
  };

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Skills Library</h2>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>8 coaching skills across 5 domains</div>
      </div>

      {/* Domain filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {domains.map(d => (
          <button key={d} onClick={() => setFilter(d)} style={{
            padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
            borderColor: filter === d ? 'var(--accent)' : 'var(--border)',
            background: filter === d ? 'var(--accent-light)' : 'var(--white)',
            color: filter === d ? 'var(--accent)' : 'var(--text-2)',
            fontSize: 13, fontWeight: filter === d ? 600 : 400, cursor: 'pointer',
            transition: 'all .12s',
          }}>{d}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {filtered.map(skill => (
          <div key={skill.id} className="card" style={{ cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            onClick={() => startSkill(skill)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', flex: 1, marginRight: 8 }}>{skill.name}</div>
              <DomainBadge domain={skill.domain} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55, marginBottom: 12 }}>{skill.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>~{skill.weeks} weeks</span>
              <button
                className="btn btn-outline"
                style={{ fontSize: 12, padding: '5px 12px' }}
                onClick={e => { e.stopPropagation(); startSkill(skill); }}
              >Start →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
