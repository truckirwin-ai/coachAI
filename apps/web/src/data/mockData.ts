export const skills = [
  { id: '1', name: 'Difficult Conversations', domain: 'Leadership', description: 'Navigate performance feedback, conflict, and hard truths with clarity and care.', weeks: 4 },
  { id: '2', name: 'Delegation & Trust', domain: 'Management', description: 'Hand off work in ways that build team capability, not dependency.', weeks: 4 },
  { id: '3', name: 'Leadership Presence', domain: 'Leadership', description: 'Command attention, inspire confidence, and lead from the front.', weeks: 4 },
  { id: '4', name: 'Managing Up', domain: 'Career', description: 'Build productive relationships with executives and shape decisions before they happen.', weeks: 3 },
  { id: '5', name: 'Giving Feedback', domain: 'Management', description: 'Deliver feedback that changes behavior without damaging relationships.', weeks: 4 },
  { id: '6', name: 'Strategic Thinking', domain: 'Strategy', description: 'Zoom out, see the landscape, and make decisions that compound over time.', weeks: 4 },
  { id: '7', name: 'Executive Communication', domain: 'Communication', description: 'Communicate up, across, and down with precision and impact.', weeks: 4 },
  { id: '8', name: 'Conflict Resolution', domain: 'Communication', description: 'Transform conflict into productive tension and stronger working relationships.', weeks: 4 },
];

export const domainColors: Record<string, { bg: string; text: string }> = {
  Leadership:    { bg: '#EBF8FF', text: '#2C5282' },
  Management:    { bg: '#F0FFF4', text: '#276749' },
  Communication: { bg: '#FAF5FF', text: '#553C9A' },
  Strategy:      { bg: '#EBF4FF', text: '#2B6CB0' },
  Career:        { bg: '#FFFBEB', text: '#744210' },
};

export const mockMessages = [
  { id: '1', role: 'coach' as const, content: "Let's pick up where we left off. You mentioned wanting to address Jordan's performance — that it's been affecting the team. What's been holding you back from having that conversation so far?", timestamp: '8:26 AM' },
  { id: '2', role: 'user' as const, content: "Honestly I'm worried he'll get defensive. We have a good relationship and I don't want to damage it.", timestamp: '8:27 AM' },
  { id: '3', role: 'coach' as const, content: "That concern — wanting to protect the relationship — actually makes this conversation more important, not less. The relationship suffers more from avoidance than from honesty delivered with care.", timestamp: '8:28 AM' },
  { id: '4', role: 'user' as const, content: "I hadn't thought about it that way. What does that look like practically?", timestamp: '8:29 AM' },
];

export const coachResponses = [
  "That's an important insight. What do you think made it difficult to say that directly?",
  "Let's sit with that for a moment. If you imagine the best version of that conversation, what does it look like?",
  "You mentioned fear of damaging the relationship. Where does that fear come from — experience with this person, or a broader pattern?",
  "What would you tell a peer who came to you with this exact situation?",
  "I notice you're framing this as your problem to solve. What if it's actually a shared problem — yours and Jordan's both?",
  "The fact that you care this much about getting it right is itself a leadership quality. What would it mean to trust that?",
  "Let's try something. Walk me through how you'd open that conversation. First sentence — go.",
  "Good. Now what do you do if he immediately gets defensive?",
  "What's the best outcome you're hoping for from this conversation?",
  "You've described what could go wrong. What does going right look like three weeks from now?",
];

export const mockSessions = [
  { id: '1', type: 'Voice', skill: 'Difficult Conversations — Refresher 1', meta: '8 min · Yesterday', score: null },
  { id: '2', type: 'Evaluation', skill: 'Delegation & Trust — Evaluation', meta: '22 min · Feb 26', score: 88 },
  { id: '3', type: 'Text', skill: 'Free-form: Board meeting prep', meta: '15 min · Feb 24', score: null },
  { id: '4', type: 'Voice', skill: 'Delegation & Trust — Refresher 4', meta: '6 min · Feb 21', score: null },
];

export const mockGoals = [
  { id: '1', name: 'Build a high-trust team by Q2', pct: 65, due: 'Jun 30' },
  { id: '2', name: 'Complete all pending 1:1 conversations', pct: 40, due: 'Mar 15' },
  { id: '3', name: 'Delegate weekly ops review', pct: 80, due: 'Mar 31' },
];

export const mockRubric = [
  { label: 'Clarity of expectations given', score: 92 },
  { label: 'Trust demonstrated (non-micromanaging)', score: 86 },
  { label: 'Support structure offered', score: 88 },
  { label: 'Accountability without control', score: 78 },
  { label: 'Recovery when challenged', score: 82 },
];
