// © 2025 Foundry SMB LLC. All rights reserved.
// CoachAI — OnboardingPage
// Two-column onboarding: dark left panel (brand + library card) + clean right panel (form steps)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { skills } from '../data/mockData';

const YEAR = new Date().getFullYear();

// ── Shared input style ────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  fontSize: 14,
  color: '#111',
  background: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#555',
  marginBottom: 6,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
};

// ── Library card (left panel) ─────────────────────────────────────────────────
function LibraryCard() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
      width: 320,
      overflow: 'hidden',
      color: '#111',
    }}>
      {/* Cover */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=640&q=75"
          alt="The Art of Saying Hard Things"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <span style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          color: '#fff', fontSize: 10, fontWeight: 700,
          padding: '3px 9px', borderRadius: 20,
        }}>🎤 TED Talk</span>
        <span style={{
          position: 'absolute', top: 10, right: 10,
          background: '#17A589', color: '#fff',
          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
        }}>🎥 Watch</span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ background: '#111', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.06em' }}>LEADERSHIP</span>
          <span style={{ fontSize: 11, color: '#999' }}>⏱ 12 min</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.3, marginBottom: 6 }}>
          The Art of Saying Hard Things
        </div>
        <div style={{
          fontSize: 12, color: '#777', lineHeight: 1.55, marginBottom: 12,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        } as React.CSSProperties}>
          A structured exploration of why difficult conversations fail — and the three shifts that make them land.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <img
            src="https://files2.heygen.ai/avatar/v3/e20ac0c902184ff793e75ae4e139b7dc_45600/preview_target.webp"
            alt="Frank Donovan"
            style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '1.5px solid #e8e8e8', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#333', lineHeight: 1.2 }}>Frank Donovan</div>
            <div style={{ fontSize: 10, color: '#aaa', lineHeight: 1.2 }}>Executive Leadership</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, background: '#f3f3f3', color: '#555', border: '1px solid #e8e8e8', padding: '2px 8px', borderRadius: 20 }}>
            Difficult Conversations
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 700, color: '#17A589', cursor: 'pointer', padding: '4px 6px' }}>🎥 Watch →</button>
            <button style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 700, color: '#111', cursor: 'pointer', padding: '4px 6px' }}>Listen →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName]         = useState('');
  const [role, setRole]         = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [selectedSkill, setSelectedSkill] = useState('');
  const { setProfile, completeOnboarding } = useUserStore();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const finish = () => {
    setProfile({ name, role, industry, focusArea: selectedSkill || 'Leadership' });
    completeOnboarding();
    navigate('/dashboard');
  };

  // ── Step progress bar ───────────────────────────────────────────────────────
  const stepLabels = ['Welcome', 'Profile', 'Focus'];
  const progressPct = ((step - 1) / 2) * 100;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      background: '#f7f7f5',
    }}>

      {/* ── Top header — centered logo + subtitle ────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '16px 0 14px', width: '100%',
        borderBottom: '1px solid #e8e8e8',
        flexShrink: 0, gap: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7, background: '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 14, fontWeight: 800,
          }}>C</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>CoachAI</span>
        </div>
        <div style={{ fontSize: 14, color: '#aaa', letterSpacing: '0.01em' }}>
          Real coaching. Real skills. Real growth.
        </div>
      </div>

      {/* ── Two columns ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* ── Left panel — 50%, card right-aligned to center seam ────────────── */}
      {!isMobile && (
        <div style={{
          width: '50%', flexShrink: 0,
          background: '#f7f7f5',
          display: 'flex', flexDirection: 'column',
          alignItems: 'flex-end', justifyContent: 'flex-start',
          padding: '48px 48px 0 40px',
        }}>
          <LibraryCard />
        </div>
      )}

      {/* ── Right panel — 50%, form left-aligned from center seam ───────────── */}
      <div style={{
        width: '50%', flexShrink: 0, background: '#f7f7f5',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'flex-start',
        padding: '48px 40px 24px 48px', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Step progress */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              {stepLabels.map((label, i) => (
                <span key={label} style={{
                  fontSize: 11, fontWeight: i + 1 === step ? 700 : 400,
                  color: i + 1 <= step ? '#111' : '#bbb',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>{label}</span>
              ))}
            </div>
            <div style={{ height: 2, background: '#e0e0e0', borderRadius: 2 }}>
              <div style={{
                height: '100%', width: `${progressPct}%`,
                background: '#111', borderRadius: 2, transition: 'width 0.4s ease',
              }} />
            </div>
          </div>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111', marginBottom: 6, letterSpacing: '-0.4px' }}>
                Welcome to CoachAI
              </div>
              <div style={{ marginBottom: 28 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36, textAlign: 'left' }}>
                {[
                  'Structured coaching programs with 4-week skill cycles',
                  'AI evaluation with rubric scores and qualitative feedback',
                  'Voice coaching — in the office, in the car, anywhere',
                ].map(text => (
                  <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ color: '#bbb', fontSize: 11, marginTop: 3, flexShrink: 0 }}>▸</span>
                    <span style={{ fontSize: 13.5, color: '#555', lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                style={{
                  padding: '9px 22px',
                  background: '#ebebeb', color: '#111',
                  border: '1px solid #ddd', borderRadius: 7,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#e0e0e0')}
                onMouseOut={e => (e.currentTarget.style.background = '#ebebeb')}
              >
                Get Started
              </button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 6, letterSpacing: '-0.3px' }}>
                Your Profile
              </div>
              <div style={{ fontSize: 14, color: '#777', marginBottom: 28 }}>
                Helps your AI coach personalize your experience.
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Name</label>
                <input
                  type="text" value={name} placeholder="Sarah Kim"
                  onChange={e => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Role / Title</label>
                <input
                  type="text" value={role} placeholder="Director of Operations"
                  onChange={e => setRole(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Industry</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)} style={inputStyle}>
                  {['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Other'].map(i => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1, padding: '11px', background: '#fff',
                    border: '1px solid #ddd', borderRadius: 8,
                    fontSize: 14, fontWeight: 500, color: '#555', cursor: 'pointer',
                  }}
                >Back</button>
                <button
                  onClick={() => { if (name && role) setStep(3); }}
                  disabled={!name || !role}
                  style={{
                    flex: 2, padding: '11px',
                    background: name && role ? '#111' : '#e0e0e0',
                    border: 'none', borderRadius: 8,
                    fontSize: 14, fontWeight: 600,
                    color: name && role ? '#fff' : '#aaa',
                    cursor: name && role ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                  }}
                >Continue</button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 6, letterSpacing: '-0.3px' }}>
                Choose Your First Skill
              </div>
              <div style={{ fontSize: 14, color: '#777', marginBottom: 24 }}>
                Pick one to start. You'll build it over a 4-week cycle.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
                {skills.slice(0, 6).map(skill => (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill.name)}
                    style={{
                      border: `1.5px solid ${selectedSkill === skill.name ? '#111' : '#e0e0e0'}`,
                      borderRadius: 10, padding: '12px 14px',
                      background: selectedSkill === skill.name ? '#111' : '#fff',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: selectedSkill === skill.name ? 'rgba(255,255,255,0.5)' : '#bbb',
                      marginBottom: 5,
                    }}>{skill.domain}</div>
                    <div style={{
                      fontSize: 13, fontWeight: 600, lineHeight: 1.3,
                      color: selectedSkill === skill.name ? '#fff' : '#111',
                    }}>{skill.name}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    flex: 1, padding: '11px', background: '#fff',
                    border: '1px solid #ddd', borderRadius: 8,
                    fontSize: 14, fontWeight: 500, color: '#555', cursor: 'pointer',
                  }}
                >Back</button>
                <button
                  onClick={finish}
                  disabled={!selectedSkill}
                  style={{
                    flex: 2, padding: '11px',
                    background: selectedSkill ? '#111' : '#e0e0e0',
                    border: 'none', borderRadius: 8,
                    fontSize: 14, fontWeight: 600,
                    color: selectedSkill ? '#fff' : '#aaa',
                    cursor: selectedSkill ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                  }}
                >Start Coaching</button>
              </div>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div style={{ marginTop: 40, fontSize: 11, color: '#bbb' }}>
          © {YEAR} Foundry SMB LLC. All rights reserved.
        </div>
      </div>

      </div>{/* end two-column wrapper */}
    </div>
  );
}
