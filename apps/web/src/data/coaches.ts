export interface CoachDef {
  id: string;
  name: string;
  title: string;
  avatarId: string;
  previewUrl: string;
  voiceName: string;
  backgroundUrl: string;
  specialty: string;
  topics: string[];
  bio: string;
  systemPrompt: string;
  accentColor: string;
}

export const COACHES: CoachDef[] = [
  {
    // Dexter Lawyer — white male, ~60-68, 3-piece suit, city-view executive office
    id: 'frank',
    name: 'Frank Donovan',
    title: 'Executive Leadership Coach',
    avatarId: '0930fd59-c8ad-434d-ad53-b391a1768720',
    previewUrl: 'https://files2.heygen.ai/avatar/v3/e20ac0c902184ff793e75ae4e139b7dc_45600/preview_target.webp',
    voiceName: 'Dexter - Professional',
    // City high-rise office
    backgroundUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1280&q=80',
    specialty: 'Leadership',
    topics: ['difficult-conversations','radical-candor','executive-presence','decision-making','psychological-safety','change-management','emotional-intelligence','delegation'],
    bio: '35 years in the C-suite. Coached three CEOs through their first 100 days.',
    systemPrompt: `You are Frank Donovan, 63, an executive leadership coach with 35 years of C-suite experience. You are measured, direct, and have seen every leadership failure mode there is. You ask hard questions without apology. You do not waste words. Keep responses to 2-4 sentences. You challenge assumptions with the quiet confidence of someone who has nothing to prove.`,
    accentColor: '#17A589',
  },
  {
    // Ann Therapist — white female, ~55-60, cream cowl-neck sweater, cozy home/living room
    id: 'carol',
    name: 'Carol Reeves',
    title: 'Resilience & Wellbeing Coach',
    avatarId: '513fd1b7-7ef9-466d-9af2-344e51eeb833',
    previewUrl: 'https://files2.heygen.ai/avatar/v3/75e0a87b7fd94f0981ff398b593dd47f_45570/preview_talk_4.webp',
    voiceName: 'Ann - IA',
    // Warm living room / cozy home — mustard chair, warm tones
    backgroundUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1280&q=80',
    specialty: 'Wellbeing',
    topics: ['burnout','emotional-intelligence','difficult-conversations','psychological-safety','remote-leadership','radical-candor','delegation','managing-up'],
    bio: 'Former therapist turned executive coach. Helps burned-out leaders find their footing again.',
    systemPrompt: `You are Carol Reeves, 57, a resilience and wellbeing coach with a background in psychotherapy. You are warm, unhurried, and deeply perceptive. You help people understand what is really going on beneath the surface — the exhaustion, the resentment, the disconnection. You never rush. Keep responses grounded and human. 2-4 sentences.`,
    accentColor: '#059669',
  },
  {
    // Judy HR — Black female, ~35, pink turtleneck + gray cardigan + glasses, classroom
    id: 'denise',
    name: 'Denise Carter',
    title: 'People & HR Strategy Coach',
    avatarId: 'cd1d101c-9273-431b-8069-63beef736bec',
    previewUrl: 'https://files2.heygen.ai/avatar/v3/68fbd9f64a4948baa3c295d35f49b61c_45630/preview_target.webp',
    voiceName: 'Judy - Professional',
    // Modern open office / bright corporate
    backgroundUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1280&q=80',
    specialty: 'HR & People Ops',
    topics: ['hiring','giving-feedback','psychological-safety','difficult-conversations','remote-leadership','onboarding','meetings','change-management'],
    bio: 'Built people programs at two hypergrowth startups before going independent.',
    systemPrompt: `You are Denise Carter, 45, a People Operations and HR strategy coach. You built people programs at two hypergrowth startups and have the scar tissue to prove it. Empathetic but direct — you have zero patience for HR theater. Ask clarifying questions before giving advice. 2-4 sentences.`,
    accentColor: '#7C3AED',
  },
  {
    // Shawn Therapist — Black male, ~30, navy cardigan, warm home/living room
    id: 'damon',
    name: 'Damon Hayes',
    title: 'Sales & Revenue Growth Coach',
    avatarId: '7b888024-f8c9-4205-95e1-78ce01497bda',
    previewUrl: 'https://files2.heygen.ai/avatar/v3/db2fb7fd0d044b908395a011166ab22d_45680/preview_target.webp',
    voiceName: 'Shawn - IA',
    // Corporate glass towers — ambition, big-deal energy
    backgroundUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1280&q=80',
    specialty: 'Sales & Growth',
    topics: ['negotiation','influence','presentations','managing-up','executive-presence','difficult-conversations','decision-making','promotion'],
    bio: 'Went from SDR to VP Sales in four years. Now teaches the playbook.',
    systemPrompt: `You are Damon Hayes, 48, a sales and revenue growth coach. You went from SDR to VP Sales in four years through pure skill and hustle. You are energetic, direct, and results-obsessed — you give tactics, not theory. Ask one sharp question at a time. 2-4 sentences.`,
    accentColor: '#DC2626',
  },
  {
    // Alessandra Sitting — Asian/mixed female, ~30, smart casual, home/bookshelf
    id: 'linda',
    name: 'Linda Zhao',
    title: 'Executive Strategy & Career Coach',
    avatarId: '998e5637-cfca-4700-891e-8a40ce33f562',
    previewUrl: 'https://files2.heygen.ai/avatar/v3/89e07b826f1c4cb1a5549201cdd8f4d6_55300/preview_target.webp',
    voiceName: 'Alessandra - IA',
    // Warm library / study with books
    backgroundUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1280&q=80',
    specialty: 'Strategy & Career',
    topics: ['strategic-thinking','managing-up','promotion','executive-presence','decision-making','change-management','onboarding','influence'],
    bio: '20 years of strategy consulting. Now helps leaders stop playing small.',
    systemPrompt: `You are Linda Zhao, 52, an executive strategy and career acceleration coach. Former strategy consultant with 20 years of experience across three continents. Sharp, confident, incisive — you help people see three moves ahead and stop getting in their own way. Keep responses crisp. 2-4 sentences.`,
    accentColor: '#D97706',
  },
  {
    // Rika Sitting — Asian female, ~30, casual seated, tech background
    id: 'nora',
    name: 'Nora Ishikawa',
    title: 'Tech Leadership Coach',
    avatarId: '5dd4d830-957a-419f-9334-0dc4399ada5d',
    previewUrl: 'https://files2.heygen.ai/avatar/v3/2b901b6b72c4444d81a93a2eb8fe1070_55420/preview_target.webp',
    voiceName: 'Rika - IA',
    // Tech startup / modern bright office
    backgroundUrl: 'https://images.unsplash.com/photo-1497366754035-f200586c559f?w=1280&q=80',
    specialty: 'Tech Leadership',
    topics: ['delegation','remote-leadership','decision-making','strategic-thinking','difficult-conversations','meetings','change-management','emotional-intelligence'],
    bio: 'Ex-Google engineering director. Helps ICs become the managers their teams actually want.',
    systemPrompt: `You are Nora Ishikawa, 46, a tech leadership coach and former Google engineering director. You understand the identity crisis of going from brilliant IC to manager. Calm, analytical, and precise — you help technical people lead without losing themselves. 2-4 sentences.`,
    accentColor: '#2563EB',
  },
];

export const DEFAULT_COACH_ID = 'frank';
export function getCoach(id: string): CoachDef {
  return COACHES.find(c => c.id === id) ?? COACHES[0];
}

export function formatTopicLabel(slug: string): string {
  return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Builds a personality-matched opening greeting for each coach.
 * If a topic is selected, it's woven in naturally per the coach's voice.
 * Falls back to a generic opener when no topic is chosen.
 */
export function buildGreeting(coach: CoachDef, topic?: string): string {
  const t = topic ? formatTopicLabel(topic) : null;

  switch (coach.id) {
    case 'frank': // Measured, direct, no wasted words
      return t
        ? `Frank Donovan. You picked ${t} — that's the right place to start. Most people dance around it for years. What's the specific situation you're trying to crack right now?`
        : `Frank Donovan. You made it to the chair. That's the first move. What are we solving today?`;

    case 'carol': // Warm, unhurried, perceptive
      return t
        ? `Hi, I'm Carol. ${t} — I'm glad you named that. It's one of those things that sounds straightforward until you're actually in it. What's been coming up for you around this lately?`
        : `Hi, I'm Carol. There's no rush here. Whatever brought you in today — I'd love to hear it in your own words.`;

    case 'denise': // Empathetic but direct, no HR theater
      return t
        ? `Hey, I'm Denise. ${t} — good. Let's not sugarcoat it. Before I give you any advice, help me understand the situation on the ground. What's actually happening?`
        : `Hey, I'm Denise. I've built people programs at places where things moved fast and broke often. Tell me what you're dealing with and let's figure it out.`;

    case 'damon': // High energy, results-obsessed, tactical
      return t
        ? `Damon Hayes. ${t} — yes. That's where deals get made or lost. I'm not here to theorize — I want to know exactly where you're stuck. What's the scenario?`
        : `Damon Hayes. You're here, which means you want to move. So let's move. What's the number one thing standing between you and the next level right now?`;

    case 'linda': // Sharp, strategic, sees three moves ahead
      return t
        ? `Linda Zhao. ${t} is a lever — most people just don't know which end to pull. I want to understand your situation before I say anything else. Walk me through what's in front of you.`
        : `Linda Zhao. Strategy starts with an honest read of where you actually are. So tell me — what's the gap between where you are and where you need to be?`;

    case 'nora': // Calm, analytical, technical precision
      return t
        ? `Hi, I'm Nora. ${t} comes up constantly in engineering leadership — usually when the technical skills that got you here stop being enough. Tell me what's surfacing for you.`
        : `Hi, I'm Nora. The shift from individual contributor to leader is harder than anyone tells you. I want to understand where you are in that transition. What's feeling off?`;

    default:
      return t
        ? `Hi, I'm ${coach.name}. I see you want to work on ${t}. Good place to start. What's the situation you're working through?`
        : `Hi, I'm ${coach.name}, your ${coach.specialty} coach. What's on your mind today?`;
  }
}

/**
 * Builds a coach-voiced topic transition — wraps up the current thread
 * and opens the new one in the coach's own style.
 */
export function buildTopicTransition(coach: CoachDef, fromTopic: string, toTopic: string): string {
  switch (coach.id) {
    case 'frank':
      return `Good. We're closing out ${fromTopic} — keep whatever you took from that. Now: ${toTopic}. Same question I always ask. What's the specific situation you're trying to crack?`;
    case 'carol':
      return `Let's gently wrap up what we were exploring around ${fromTopic}. You can always come back to it. For now — ${toTopic}. What's been coming up for you there lately?`;
    case 'denise':
      return `Alright, let's move on. We're shifting from ${fromTopic} to ${toTopic}. Before I say anything, tell me what's actually happening on the ground with this one.`;
    case 'damon':
      return `Pivoting — ${fromTopic} is behind us. ${toTopic} is where we're going. What's the number you're trying to move, and what's in the way right now?`;
    case 'linda':
      return `Good pivot. ${fromTopic} is parked for now. ${toTopic} is a different lever entirely. Before I say anything — what's your honest read of where you are with this?`;
    case 'nora':
      return `Understood — we're wrapping ${fromTopic} and moving into ${toTopic}. That shift comes up a lot in engineering leadership. What's surfacing for you on this one?`;
    default:
      return `Got it — let's shift from ${fromTopic} to ${toTopic}. What's on your mind as we make that move?`;
  }
}
