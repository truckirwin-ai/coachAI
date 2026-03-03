import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { skills } from '../data/mockData';
import { DomainBadge } from '../components/ui/Badge';

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', role: '', industry: 'Technology', focusArea: 'Leadership' });
  const [selectedSkill, setSelectedSkill] = useState('1');
  const { setProfile, completeOnboarding } = useUserStore();
  const navigate = useNavigate();

  const finish = () => {
    setProfile(form);
    completeOnboarding();
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎯</div>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)' }}>CoachAI</span>
          </div>
          {/* Step indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{
                width: s === step ? 24 : 8, height: 8, borderRadius: 4,
                background: s <= step ? 'var(--accent)' : 'var(--border)',
                transition: 'all .3s',
              }} />
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 36, boxShadow: '0 4px 20px rgba(44,36,22,.08)' }}>

          {step === 1 && (
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Welcome to CoachAI</h1>
              <p style={{ color: 'var(--text-2)', marginBottom: 28, lineHeight: 1.6 }}>Your AI-powered business coaching partner. Build real skills. Get evaluated. Track your growth.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {['Structured coaching programs with 4-week skill cycles', 'AI evaluation with rubric scores and qualitative feedback', 'Voice coaching — in the office, in the car, anywhere'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</div>
                    <span style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}>Get Started →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Your Profile</h2>
              <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 24 }}>This helps your AI coach personalize your experience.</p>
              {[
                { label: 'Your Name', key: 'name', type: 'text', placeholder: 'Sarah K.' },
                { label: 'Your Role / Title', key: 'role', type: 'text', placeholder: 'Director of Operations' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Industry</label>
                <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}>
                  {['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Other'].map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Primary Focus Area</label>
                <select value={form.focusArea} onChange={e => setForm(f => ({ ...f, focusArea: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 14, background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}>
                  {['Leadership', 'Management', 'Communication', 'Strategy', 'Career Development'].map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
                <button onClick={() => setStep(3)} disabled={!form.name || !form.role} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Choose Your First Skill</h2>
              <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 20 }}>You'll build this over a 4-week cycle. More skills unlock as you progress.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {skills.slice(0, 6).map(skill => (
                  <div key={skill.id} onClick={() => setSelectedSkill(skill.id)} style={{
                    border: `2px solid ${selectedSkill === skill.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                    background: selectedSkill === skill.id ? 'var(--accent-light)' : 'var(--white)',
                    transition: 'all .15s',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{skill.name}</div>
                    <DomainBadge domain={skill.domain} />
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.4 }}>{skill.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>~{skill.weeks} weeks</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(2)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
                <button onClick={finish} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Start Coaching →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
