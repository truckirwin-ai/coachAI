export interface AssessmentQuestion {
  id: string;
  question: string;
  options: {
    id: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface Assessment {
  id: string;
  title: string;
  domain: string;
  description: string;
  estimatedMins: number;
  questionCount: number;
  relatedLessons: string[];
  questions: AssessmentQuestion[];
}

export const assessments: Assessment[] = [
  {
    id: 'a1',
    title: 'Leadership Communication',
    domain: 'Leadership',
    description: 'Test your understanding of difficult conversations, radical candor, and executive presence.',
    estimatedMins: 10,
    questionCount: 10,
    relatedLessons: ['l1', 'l2', 'l5'],
    questions: [
      {
        id: 'lc-1',
        question: 'According to the research cited in "The Art of Saying Hard Things," what was the average length of time managers avoided a difficult conversation?',
        options: [
          { id: 'A', text: '3 months' },
          { id: 'B', text: '6 months' },
          { id: 'C', text: '14 months' },
          { id: 'D', text: '2 years' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C — 14 months. Harvard Business School researchers studying 500 managers across 40 companies found the average avoidance period was 14 months. This reveals how chronic and systemic avoidance is — not occasional reluctance but sustained delay that erodes relationships and performance. A (3 months) and B (6 months) significantly understate the finding. D (2 years) overstates the average, though some individual cases exceeded that.',
      },
      {
        id: 'lc-2',
        question: 'Which statement best reflects the "first shift" described in "The Art of Saying Hard Things"?',
        options: [
          { id: 'A', text: 'Tell the person exactly how their behavior makes you feel' },
          { id: 'B', text: 'Separate the person from the pattern — address behavior, not character' },
          { id: 'C', text: 'Schedule a formal meeting so the person can prepare' },
          { id: 'D', text: 'Start with positive feedback before raising concerns' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. The first shift is separating the person from the pattern. "Your work has been late three times this month" addresses a pattern; "you\'re unreliable" attacks character. Pattern-based feedback opens a door; character attacks close it. A (sharing feelings) conflates emotional disclosure with the person/pattern distinction. C (scheduling) relates to timing, not the core shift. D (positive-first) is a delivery format, not what the lesson describes.',
      },
      {
        id: 'lc-3',
        question: 'What does the lesson "The Art of Saying Hard Things" identify as the real reason managers avoid difficult conversations?',
        options: [
          { id: 'A', text: 'They genuinely care about protecting the relationship' },
          { id: 'B', text: 'They lack the vocabulary for feedback conversations' },
          { id: 'C', text: 'They are protecting themselves from discomfort, not the relationship' },
          { id: 'D', text: 'They are waiting for HR guidance before proceeding' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. The lesson explicitly states: "We\'re protecting ourselves from discomfort, from conflict, from the possibility that honesty might cost us something." The relationship-protection story is a rationalization. A sounds noble but is precisely the myth the lesson debunks. B (vocabulary) is a common excuse but not what the research identifies. D (HR guidance) is not mentioned and reflects institutional delay, not the psychological driver.',
      },
      {
        id: 'lc-4',
        question: 'According to the lesson on Radical Candor, most managers who implement the framework incorrectly end up in which quadrant(s)?',
        options: [
          { id: 'A', text: 'Radical Candor — they care and challenge equally' },
          { id: 'B', text: 'Manipulative Insincerity — they neither care nor challenge' },
          { id: 'C', text: 'Obnoxious Aggression or Ruinous Empathy — they get one axis right and miss the other' },
          { id: 'D', text: 'Radical Candor in theory but Manipulative Insincerity in practice' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. The lesson states that managers who\'ve read Kim Scott\'s book often end up in obnoxious aggression (nailed the challenge, forgot the care) or ruinous empathy (care deeply, say nothing useful). A is the goal, not the failure mode. B describes people who\'ve abandoned the framework entirely. D conflates two distinct quadrants and doesn\'t reflect what the lesson describes.',
      },
      {
        id: 'lc-5',
        question: 'What is the "60-second feedback rule" described in Radical Candor in Practice?',
        options: [
          { id: 'A', text: 'All feedback conversations should be limited to 60 seconds to prevent defensiveness' },
          { id: 'B', text: 'After observing something worth addressing, give the feedback within 60 seconds — not in a scheduled meeting' },
          { id: 'C', text: 'Wait 60 seconds after the person speaks before responding' },
          { id: 'D', text: 'Prepare a 60-second script before any feedback conversation' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. The 60-second rule is about immediacy: when you observe something worth addressing — good or bad — you have 60 seconds to say something. Not a scheduled meeting. Right then, in the moment. That immediacy makes feedback feel like coaching rather than evaluation. A misunderstands it — it\'s about when to give feedback, not how long it takes. C describes a pause technique, not the rule. D describes preparation, which is the opposite of the immediacy advocated.',
      },
      {
        id: 'lc-6',
        question: 'What does the lesson on Executive Presence identify as the central signal that a leader actually has presence?',
        options: [
          { id: 'A', text: 'Confidence, charisma, and how they carry themselves physically' },
          { id: 'B', text: 'A quality of settledness — the room believes they\'ve already decided' },
          { id: 'C', text: 'High energy, vocal variety, and commanding body language' },
          { id: 'D', text: 'The ability to speak without notes for extended periods' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. The lesson explicitly rejects the popular definition (confidence, charisma) and defines presence as: does the room believe you\'ve already decided? That quality of settledness — the sense that the leader has already done the hard thinking — is what registers as presence. A is the "dangerously incomplete" popular version the lesson debunks. C describes performance traits. D is not mentioned as a presence driver.',
      },
      {
        id: 'lc-7',
        question: 'Which of the following is NOT one of the four drivers of executive presence described in "The Psychology of Executive Presence"?',
        options: [
          { id: 'A', text: 'Clarity over completeness' },
          { id: 'B', text: 'Comfort with silence' },
          { id: 'C', text: 'Consistent eye contact' },
          { id: 'D', text: 'Selective speech' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C — consistent eye contact is not one of the four drivers. The four are: (1) clarity over completeness, (2) comfort with silence, (3) physical stillness, and (4) selective speech. Physical stillness includes not breaking eye contact to think, but "consistent eye contact" as a standalone driver is not articulated. A, B, and D are all directly listed.',
      },
      {
        id: 'lc-8',
        question: 'According to "The Psychology of Executive Presence," what does physical stillness communicate to a room?',
        options: [
          { id: 'A', text: 'Boredom and disengagement from the conversation' },
          { id: 'B', text: 'Anxiety and discomfort with the topic' },
          { id: 'C', text: 'Authority — movement communicates anxiety' },
          { id: 'D', text: 'Openness to others\' contributions' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. The lesson states directly: "Stillness is authority. Movement is anxiety." Leaders with presence don\'t fidget, shift in their chair when challenged, or break eye contact to think. Stillness is learnable, but requires noticing when your body is performing your uncertainty for the room. A and B invert the lesson\'s point. D is not the message drawn from physical stillness.',
      },
      {
        id: 'lc-9',
        question: 'In "The Art of Saying Hard Things," what does the third shift suggest a leader should name as the reason for having a difficult conversation?',
        options: [
          { id: 'A', text: 'The company\'s performance standards and HR requirements' },
          { id: 'B', text: 'The manager\'s own frustration with the pattern' },
          { id: 'C', text: 'The relationship itself — bringing it up because they believe in the person\'s potential' },
          { id: 'D', text: 'The impact the behavior has had on the broader team' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. The third shift is to name the relationship as the reason you\'re having the conversation. The example: "I\'m bringing this up because I think you\'re capable of more, and I don\'t want this to become the thing that limits you." This reframes the conversation from judgment to investment. A (HR requirements) is procedural, not relational. B (personal frustration) centers the manager, not the relationship. D (team impact) is a valid framing but not the third shift described.',
      },
      {
        id: 'lc-10',
        question: 'The Radical Candor lesson offers an example of a 14-word piece of feedback delivered in the moment. What principle does it primarily illustrate?',
        options: [
          { id: 'A', text: 'That feedback must always be brief and transactional' },
          { id: 'B', text: 'That immediate, specific feedback in the moment deepens relationships and coaches without requiring a meeting' },
          { id: 'C', text: 'That written feedback is superior to verbal feedback' },
          { id: 'D', text: 'That naming a skill explicitly is the most effective form of reinforcement' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. The example — "That question you asked in the meeting just now — that\'s exactly the kind of strategic thinking I want you to bring more of" — demonstrates that immediate, specific positive feedback (in the moment, not in a meeting) deepens the relationship and feels like coaching. A over-simplifies: brevity is a byproduct of immediacy, not the principle. C (written vs. verbal) is not the lesson\'s point. D (naming the skill) is present in the example but not the core insight drawn.',
      },
    ],
  },
  {
    id: 'a2',
    title: 'Management Fundamentals',
    domain: 'Management',
    description: 'Test your knowledge of delegation, managing up, accountability, and what great management actually looks like.',
    estimatedMins: 10,
    questionCount: 10,
    relatedLessons: ['l3', 'l4'],
    questions: [
      {
        id: 'mf-1',
        question: 'According to "Delegation Without Losing Control," what is the key distinction between assignment and delegation?',
        options: [
          { id: 'A', text: 'Assignment is for senior employees; delegation is for junior employees' },
          { id: 'B', text: 'Delegation includes outcome, context, latitude, and a check-in; assignment is just "go do this"' },
          { id: 'C', text: 'Assignment is more formal and requires written documentation' },
          { id: 'D', text: 'Delegation gives the employee full autonomy with no check-ins' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. Sam\'s definition: "Assignment is go do this. Delegation is here\'s the outcome I need, here\'s why it matters, here\'s the latitude you have, here\'s when I want an update." Assignment sets people up to fail. Delegation sets them up to own something. A inverts the seniority logic — the distinction is about quality of handoff, not role level. C (formal documentation) is not part of the distinction drawn. D misrepresents delegation — it explicitly includes a check-in.',
      },
      {
        id: 'mf-2',
        question: 'In the delegation lesson, Sam describes the difference between accountability and control. Which statement best captures that distinction?',
        options: [
          { id: 'A', text: 'Accountability means checking in daily; control means checking in weekly' },
          { id: 'B', text: 'Accountability is about whether it gets done; control is about being involved in how it gets done' },
          { id: 'C', text: 'Control is the manager\'s responsibility; accountability belongs to the employee' },
          { id: 'D', text: 'Accountability and control are the same thing, just described differently at different levels' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. Sam states: "Accountability is I need to know this will get done. Control is I need to be involved in how it gets done." Once you\'ve hired and trained someone, your job is accountability — not control. Daily check-ins are control dressed up as accountability. A conflates the concepts with frequency. C inverts the correct assignment. D is wrong — the lesson treats them as meaningfully distinct concepts that managers consistently confuse.',
      },
      {
        id: 'mf-3',
        question: 'What mental model does the delegation lesson offer to help managers recognize when they\'re over-involved?',
        options: [
          { id: 'A', text: 'The pilot vs. co-pilot model — know when to hand over the controls' },
          { id: 'B', text: 'The board member vs. COO model — ask whether you should be setting direction or in the operations' },
          { id: 'C', text: 'The manager vs. individual contributor model — don\'t do work your team should own' },
          { id: 'D', text: 'The 80/20 model — delegate 80% of tasks and keep 20% for yourself' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. Sam\'s mental model: "Think of yourself as a board member, not a COO. A board member sets direction, asks hard questions, and gets out of the way. A COO is in the operations." For each task, ask: am I a board member here or a COO? If you\'re a COO when you should be board-membering, that\'s the delegation opportunity. A (pilot/co-pilot) is not from this lesson. C (manager vs. IC) is related but distinct. D (80/20) is not what the lesson teaches.',
      },
      {
        id: 'mf-4',
        question: 'According to the delegation lesson, if a direct report keeps delivering poor work after clear delegation, what does that indicate?',
        options: [
          { id: 'A', text: 'A delegation problem — the manager needs to provide more context' },
          { id: 'B', text: 'A motivation problem — the employee doesn\'t care enough' },
          { id: 'C', text: 'A performance problem — it requires a different conversation, not a delegation fix' },
          { id: 'D', text: 'A communication problem — the two need a better working agreement' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. Sam is explicit: "If you\'ve delegated clearly and the work keeps coming back wrong, that\'s a different conversation entirely. That\'s a performance conversation, not a delegation conversation. Don\'t confuse the two. Fixing your delegation won\'t fix a performance problem." A applies only when the setup was bad — after clear delegation, the framing changes. B (motivation) may be a factor but isn\'t the diagnostic the lesson offers. D may overlap but the lesson specifically names performance as the path.',
      },
      {
        id: 'mf-5',
        question: 'In "Managing Up: A Real Conversation," Jordan distinguishes real managing up from what most people actually do. What does he say most people are actually doing?',
        options: [
          { id: 'A', text: 'Networking — building social capital with executives' },
          { id: 'B', text: 'Managing their own anxiety — charming the boss and never bringing problems' },
          { id: 'C', text: 'Over-communicating — sending too many status updates' },
          { id: 'D', text: 'Performing — prioritizing visibility over actual results' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. Jordan\'s exact words: "The popular version is exactly what you said — charm your executive, make them like you, never bring them problems. That\'s not managing up. That\'s managing your own anxiety." Real managing up is about making your boss successful so you become indispensable. A (networking) is related but not the trap Jordan identifies. C (over-communicating) is not the failure mode described. D (performing) is a real career trap but not Jordan\'s framing.',
      },
      {
        id: 'mf-6',
        question: 'According to Jordan in the Managing Up lesson, what is the core of real managing up?',
        options: [
          { id: 'A', text: 'Exceeding your metrics every quarter so your boss looks good in reviews' },
          { id: 'B', text: 'Understanding what keeps your boss up at 2am and orienting your work around protecting them from that outcome' },
          { id: 'C', text: 'Proactively asking for stretch assignments to demonstrate ambition' },
          { id: 'D', text: 'Building a personal brand that makes you visible to senior leadership' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. Jordan says the core is "understanding what your boss actually cares about — not what they say they care about in all-hands meetings, but what keeps them up at 2am. What\'s the thing that if it goes wrong, their year goes wrong? Once you know that, you orient your work around protecting them from that outcome." A (exceeding metrics) is task execution. C (stretch assignments) is career development. D (personal brand) is self-promotion — precisely what Jordan contrasts with genuine managing up.',
      },
      {
        id: 'mf-7',
        question: 'What does Jordan say is the biggest mistake people make when they think they\'re managing up but are actually doing the opposite?',
        options: [
          { id: 'A', text: 'Disagreeing with their boss in public settings' },
          { id: 'B', text: 'Taking credit for work the team actually did' },
          { id: 'C', text: 'Escalating problems without solutions — training the boss to see them as someone who creates work' },
          { id: 'D', text: 'Waiting too long to ask for a promotion' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. Jordan: "Every time you walk into your boss\'s office with a problem and no options, you\'re training them to see you as someone who creates work for them." The correct approach: here\'s the problem, here are three ways I could handle it, here\'s what I recommend and why — asking for alignment, not permission. A (public disagreement) is a different topic. B (taking credit) is an integrity issue. D (promotion timing) is career strategy.',
      },
      {
        id: 'mf-8',
        question: 'What question does Jordan recommend asking your boss directly to understand what they actually care about?',
        options: [
          { id: 'A', text: '"What are your top three priorities this year?"' },
          { id: 'B', text: '"What would make this quarter a win for you, specifically?"' },
          { id: 'C', text: '"How can I better support your goals?"' },
          { id: 'D', text: '"What skills should I be developing to advance?"' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. Jordan\'s specific recommended question: "What would make this quarter a win for you, specifically?" He notes: "Most executives have never been asked that by a direct report and it lands hard." A (top priorities) is too broad and generic. C (support your goals) is vague and positioning. D (skills development) is about the employee\'s growth, not understanding the boss\'s actual concerns.',
      },
      {
        id: 'mf-9',
        question: 'What does Jordan say separates people who get promoted from those who plateau?',
        options: [
          { id: 'A', text: 'Perfect task execution and meeting all KPIs consistently' },
          { id: 'B', text: 'Strong relationships with peers across the organization' },
          { id: 'C', text: 'Being the person their boss can\'t imagine not having in the room' },
          { id: 'D', text: 'Advocating clearly for themselves in performance reviews' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. Jordan\'s exact framing: "The people who get promoted aren\'t the ones who execute tasks perfectly. They\'re the ones their boss can\'t imagine not having in the room." This captures the indispensability that comes from genuine managing up. A (perfect execution) is explicitly contrasted with the real differentiator. B (peer relationships) is valuable but not what Jordan identifies. D (self-advocacy) is a tactic, not the underlying quality Jordan describes.',
      },
      {
        id: 'mf-10',
        question: 'When Jordan describes escalating problems with solutions, Alex responds that it represents a completely different posture. What posture does Alex name?',
        options: [
          { id: 'A', text: 'A subordinate who follows directions well' },
          { id: 'B', text: 'An entrepreneur who acts independently' },
          { id: 'C', text: 'A peer, not a subordinate' },
          { id: 'D', text: 'A consultant advising from the outside' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. After Jordan describes the "problem + three options + recommendation" approach, Alex says: "That\'s a completely different posture. You\'re showing up as a peer, not a subordinate." This peer-level engagement is the long game that differentiates true managing up from anxious deference. A (subordinate) is precisely what the approach avoids. B (entrepreneur) implies more independence than the lesson describes. D (consultant) is not the language the lesson uses.',
      },
    ],
  },
  {
    id: 'a3',
    title: 'Strategic Thinking',
    domain: 'Strategy',
    description: 'Test your understanding of the strategy vs. tactics distinction and how senior leaders develop strategic thinking.',
    estimatedMins: 8,
    questionCount: 8,
    relatedLessons: ['l6'],
    questions: [
      {
        id: 'st-1',
        question: 'According to Morgan in "Strategy vs. Tactics," why is the transition from tactical to strategic thinking so hard for promoted leaders?',
        options: [
          { id: 'A', text: 'Strategic thinking requires specialized training most organizations don\'t provide' },
          { id: 'B', text: 'Tactical success is what got them promoted, so they default to what made them successful' },
          { id: 'C', text: 'Strategic thinking is cognitively harder than tactical execution' },
          { id: 'D', text: 'Organizations actively punish leaders who spend time thinking rather than doing' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. Morgan\'s explanation: "Because tactical success is what got them promoted. They were great at execution, at solving immediate problems, at being the person who knew how things worked. And then they get promoted and suddenly the job is to think in years, not days. Nobody told them that. Nobody trained them for it. So they default to what made them successful." A is partially true but not Morgan\'s diagnosis. C conflates difficulty with the incentive/habit dynamic. D is a contributing factor but a secondary point.',
      },
      {
        id: 'st-2',
        question: 'What does being "stuck in the weeds" look like from the outside, according to Morgan?',
        options: [
          { id: 'A', text: 'A leader who misses deadlines and avoids operational details' },
          { id: 'B', text: 'A leader who optimizes what exists instead of questioning whether it should exist — incredibly busy while nothing changes' },
          { id: 'C', text: 'A leader who delegates too much and loses touch with the team\'s work' },
          { id: 'D', text: 'A leader who focuses on long-term planning at the expense of execution' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. Morgan\'s description: they can tell you everything about how something works but can\'t explain why it matters to the company\'s direction in three years. "They optimize what exists instead of questioning whether it should exist. They\'re incredibly busy and somehow nothing changes." A describes operational problems — the opposite of a tactical thinker who\'s deeply operational. C describes over-delegation. D describes the strategic direction they\'re failing to take.',
      },
      {
        id: 'st-3',
        question: 'What is the first of the three practices Morgan recommends for developing strategic thinking?',
        options: [
          { id: 'A', text: 'Block time for weekly strategy sessions with your leadership team' },
          { id: 'B', text: 'Read broadly outside your industry to gain new mental models' },
          { id: 'C', text: 'Force yourself to work backwards from a three-year outcome, not forward from today\'s problem' },
          { id: 'D', text: 'Identify the one strategic priority that matters most and say no to everything else' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. Morgan\'s three practices are: (1) force yourself to work backwards from a three-year outcome, not forward from today\'s problem; (2) ask what would have to be true for your current approach to fail catastrophically; (3) protect time explicitly for thinking, not doing. A describes a group meeting format, not the individual practice Morgan describes. B (broad reading) is a common recommendation but not one of Morgan\'s three. D (singular focus) is a prioritization framework.',
      },
      {
        id: 'st-4',
        question: 'Morgan\'s second practice is asking "what would have to be true for your current approach to fail catastrophically." What cognitive skill does this practice develop?',
        options: [
          { id: 'A', text: 'Pessimism and risk aversion that prevents bold decision-making' },
          { id: 'B', text: 'Pre-mortem thinking that surfaces hidden assumptions and vulnerabilities in current strategy' },
          { id: 'C', text: 'Scenario planning skills useful only in formal strategy workshops' },
          { id: 'D', text: 'The ability to predict market shifts before competitors' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. This practice is a form of pre-mortem thinking — examining what would have to be true for failure and taking those answers seriously. It forces leaders to interrogate hidden assumptions rather than optimize a strategy that may be fundamentally flawed. A misidentifies the purpose — interrogating failure conditions isn\'t pessimism, it\'s rigor. C (scenario planning workshops) is a formal process; Morgan\'s practice is an individual thinking habit. D (predicting market shifts) is an outcome, not the cognitive skill built.',
      },
      {
        id: 'st-5',
        question: 'What is Morgan\'s third practice for developing strategic thinking, and why does she call it "the job at the senior level"?',
        options: [
          { id: 'A', text: 'Weekly team strategy sessions — because strategy is a team sport' },
          { id: 'B', text: 'External mentoring — because senior leaders need outside perspective' },
          { id: 'C', text: 'Protecting dedicated thinking time with no agenda and no output — because organizations reward visible busyness but strategic thinking looks like doing nothing' },
          { id: 'D', text: 'Monthly board-level reviews — because strategy must be accountable' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. Morgan: "Protect time that is explicitly for thinking, not doing. No agenda, no output. Just thinking. Most leaders treat thinking time as a luxury. It\'s actually the job." She calls it the job because the most strategically valuable thing a senior leader can do in a given week might look like they did nothing — they read, thought, had one conversation that shifted their mental model. A (team sessions) has output and agenda. B (mentoring) is not the third practice. D (board reviews) is accountability structure.',
      },
      {
        id: 'st-6',
        question: 'How does Morgan characterize a senior leader whose calendar is perpetually back-to-back?',
        options: [
          { id: 'A', text: 'A highly engaged leader with strong operational instincts' },
          { id: 'B', text: 'Someone who has successfully scaled their influence across the organization' },
          { id: 'C', text: 'A very expensive tactician — not actually doing strategy' },
          { id: 'D', text: 'An overworked leader who needs better delegation skills' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. Morgan\'s exact words: "If your calendar is back-to-back, you\'re not doing strategy. You\'re a very expensive tactician." This reframes constant busyness as a failure of the strategic role, not a sign of commitment. A inverts the lesson\'s framing. B (scaling influence) is not how Morgan interprets full calendars. D (delegation problem) may also be true, but Morgan\'s framing is specifically about the strategic vs. tactical identity.',
      },
      {
        id: 'st-7',
        question: 'A tactical thinker can describe everything about how something works. What key capability are they missing?',
        options: [
          { id: 'A', text: 'The ability to communicate strategy clearly to their team' },
          { id: 'B', text: 'The ability to explain why it matters to the company\'s direction in three years' },
          { id: 'C', text: 'The financial literacy to connect their work to business outcomes' },
          { id: 'D', text: 'The network to understand what other business units are doing' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. Morgan\'s diagnosis: "They can tell you everything about how something works but can\'t tell you why it matters to the company\'s direction in three years." The missing capability is connecting present-state work to future-state direction — the core of strategic thinking. A (communication) is a separate skill. C (financial literacy) may be relevant but isn\'t the specific gap Morgan identifies. D (network) is useful but not Morgan\'s diagnostic.',
      },
      {
        id: 'st-8',
        question: 'Morgan says the most strategically valuable thing a senior leader can do in a week might look like they did nothing. What does that valuable "nothing" actually involve?',
        options: [
          { id: 'A', text: 'Delegating all operational work to direct reports' },
          { id: 'B', text: 'Reading, thinking, and having one conversation that shifts their mental model' },
          { id: 'C', text: 'Preparing detailed presentations for board-level reviews' },
          { id: 'D', text: 'Attending industry conferences and external networking events' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. Morgan\'s exact words: "They read, they thought, they had one conversation that shifted their mental model. That\'s the job at the senior level." The apparent emptiness masks real strategic work that isn\'t visible in a meeting or deliverable but compounds over time. A (delegation) frees up time but isn\'t the thinking activity itself. C (board presentations) is operational output with an agenda. D (conferences) may support strategic thinking but isn\'t what Morgan names.',
      },
    ],
  },
  {
    id: 'a4',
    title: 'Career Development',
    domain: 'Career',
    description: 'Test your understanding of promotion, managing up, credibility-building, and executive presence as career tools.',
    estimatedMins: 8,
    questionCount: 8,
    relatedLessons: ['l3', 'l5', 'l6'],
    questions: [
      {
        id: 'cd-1',
        question: 'According to the Managing Up lesson, what separates the people who get promoted from those who plateau?',
        options: [
          { id: 'A', text: 'Consistently exceeding performance targets in their current role' },
          { id: 'B', text: 'Building strong cross-functional relationships throughout the company' },
          { id: 'C', text: 'Being the person their boss can\'t imagine not having in the room' },
          { id: 'D', text: 'Publicly advocating for themselves during review cycles' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. Jordan\'s framing: "The people who get promoted aren\'t the ones who execute tasks perfectly. They\'re the ones their boss can\'t imagine not having in the room." Promotion is fundamentally about perceived indispensability to the decision-maker above you. A (exceeding targets) is explicitly contrasted with the real differentiator. B (cross-functional relationships) is valuable but not Jordan\'s identified differentiator. D (self-advocacy) is a tactic but not the underlying quality Jordan describes.',
      },
      {
        id: 'cd-2',
        question: 'The Executive Presence lesson argues the popular version of presence is incomplete. What is the actual foundation of executive presence?',
        options: [
          { id: 'A', text: 'Years of experience that creates natural authority' },
          { id: 'B', text: 'Settledness — the room\'s sense that you\'ve already done the hard thinking and decided' },
          { id: 'C', text: 'High emotional intelligence that makes others feel comfortable' },
          { id: 'D', text: 'A strong track record of results that people know and respect' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. The lesson defines presence as one thing: does the room believe you\'ve already decided? The settledness — the sense that this person has already done the hard thinking — is what registers as presence. A (years of experience) may contribute but is not the mechanism identified. C (emotional intelligence) is a related capability but not the specific signal described. D (track record) is past performance, not the present-tense quality of settledness the lesson focuses on.',
      },
      {
        id: 'cd-3',
        question: 'What does the Executive Presence lesson say about hedging and over-qualifying your statements in professional settings?',
        options: [
          { id: 'A', text: 'Speaking less makes people think you\'re disengaged from the discussion' },
          { id: 'B', text: 'Hedging builds credibility by demonstrating nuance and intellectual humility' },
          { id: 'C', text: 'Hedging, filler, and over-qualifying dilute your signal — every word should be load-bearing' },
          { id: 'D', text: 'You should prepare key phrases in advance to avoid filler words' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. The lesson\'s fourth presence driver — selective speech — states: "Every word you speak should be load-bearing. If you\'re adding filler, hedging, or over-qualifying, you\'re diluting the signal. Say the thing. Stop. Let it land." A inverts the lesson\'s logic — saying less with purpose reads as more powerful. B explicitly contradicts the lesson. D (preparation) may help but isn\'t the principle articulated.',
      },
      {
        id: 'cd-4',
        question: 'From a career development perspective, what does the strategy lesson suggest happens to leaders who remain primarily tactical as they rise in seniority?',
        options: [
          { id: 'A', text: 'They plateau and become viewed as very expensive tacticians rather than strategic leaders' },
          { id: 'B', text: 'They eventually develop strategic thinking naturally through accumulated experience' },
          { id: 'C', text: 'They excel in execution-focused cultures that value operational expertise' },
          { id: 'D', text: 'They become valuable individual contributors rather than senior leaders' },
        ],
        correctAnswer: 'A',
        explanation: 'The correct answer is A. Morgan\'s conclusion: "If your calendar is back-to-back, you\'re not doing strategy. You\'re a very expensive tactician." In career terms, this is a ceiling — tactical leaders with senior titles deliver diminishing returns relative to their cost. B is contradicted by the lesson — tactical habits deepen without deliberate intervention. C partially true in some cultures but not Morgan\'s framing. D (individual contributor) would represent a demotion, not the trajectory of a promoted tactical thinker.',
      },
      {
        id: 'cd-5',
        question: 'What does the Executive Presence lesson say about the relationship between pausing before you answer and perceived confidence?',
        options: [
          { id: 'A', text: 'Pausing in meetings signals uncertainty and should be avoided' },
          { id: 'B', text: 'Taking three seconds before answering reads as thought, and thought reads as confidence' },
          { id: 'C', text: 'Silence is risky in fast-paced environments where decisiveness is rewarded' },
          { id: 'D', text: 'Silence creates ambiguity about your position and should be avoided' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. The lesson on comfort with silence states: "Presence is the willingness to take three seconds after a question before you answer. That pause reads as thought. Thought reads as confidence." The reflexive fill — the um, the "good question," the throat-clearing — kills presence. A directly contradicts the lesson. C inverts its advice. D is the instinct the lesson explicitly challenges.',
      },
      {
        id: 'cd-6',
        question: 'What does managing up require you to understand about your boss that most professionals never bother to learn?',
        options: [
          { id: 'A', text: 'Their preferred communication style and meeting format' },
          { id: 'B', text: 'What they say they care about in all-hands meetings' },
          { id: 'C', text: 'What keeps them up at 2am — the thing that if it goes wrong, their year goes wrong' },
          { id: 'D', text: 'Their career goals and personal ambitions within the company' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. Jordan\'s framework: understanding what your boss actually cares about — "not what they say they care about in all-hands meetings, but what keeps them up at 2am." This real-stakes knowledge lets you orient your work around protecting them from that outcome. A (communication style) is surface-level. B is explicitly what Jordan says NOT to rely on. D (career goals) is related but Jordan\'s focus is on the operational fear that drives their decisions.',
      },
      {
        id: 'cd-7',
        question: 'The delegation lesson describes being an "accidental COO." What career risk does this create for managers?',
        options: [
          { id: 'A', text: 'They become too focused on results and lose team morale' },
          { id: 'B', text: 'They stay so operationally involved that they fail to develop the strategic judgment needed for senior roles' },
          { id: 'C', text: 'They create dependency in their team that undermines performance when the manager is absent' },
          { id: 'D', text: 'They get promoted too quickly before they\'re ready' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. Sam\'s board member vs. COO model diagnoses the accidental COO as someone doing operational work they should have delegated — acting as COO when they should be board-membering. The career risk is remaining a sophisticated executor rather than developing the direction-setting judgment senior roles require. C (team dependency) is a downstream consequence of poor delegation but not the primary career risk the lesson frames. A and D are not the framing the lesson uses.',
      },
      {
        id: 'cd-8',
        question: 'Based on the lessons, which combination of behaviors most consistently separates leaders who advance from those who plateau?',
        options: [
          { id: 'A', text: 'Perfect execution, broad visibility, and strong peer relationships' },
          { id: 'B', text: 'Serving their boss\'s real priorities, thinking in years not days, and communicating with settled conviction' },
          { id: 'C', text: 'Delivering results consistently, never missing deadlines, and being liked by the team' },
          { id: 'D', text: 'Technical expertise, cross-functional credibility, and executive sponsorship' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. This synthesis draws directly from three lessons: managing up (understanding and serving your boss\'s real priorities), strategic thinking (working backwards from a 3-year outcome), and executive presence (clarity over completeness, selective speech, settled conviction). A (execution + visibility) gets people to mid-level but not beyond, per the managing up lesson. C describes task-level performance, not leadership differentiation. D names real attributes but misses the specific behavioral patterns the lessons identify.',
      },
    ],
  },
  {
    id: 'a5',
    title: 'Influence & Persuasion',
    domain: 'Influence',
    description: 'Test your knowledge of feedback, buy-in, persuasion, and how leaders shape decisions and behavior.',
    estimatedMins: 8,
    questionCount: 8,
    relatedLessons: ['l1', 'l2', 'l3', 'l5'],
    questions: [
      {
        id: 'ip-1',
        question: 'The lesson "The Art of Saying Hard Things" argues that difficult conversations serve the relationship rather than threaten it. What evidence does it cite?',
        options: [
          { id: 'A', text: 'Teams that receive regular feedback report higher engagement scores' },
          { id: 'B', text: 'The relationships that survive the longest are the ones where hard things get said directly' },
          { id: 'C', text: 'Leaders who have direct conversations are rated more trustworthy in 360 reviews' },
          { id: 'D', text: 'Employees prefer direct managers over supportive ones by a 3-to-1 margin' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. The lesson states: "the relationships that survive the longest are the ones where hard things get said directly." This inverts the avoidance instinct — the fear that honesty will damage relationships is contradicted by evidence showing avoidance is what destroys them over time. A, C, and D cite plausible statistics but none appear in the lesson. The lesson\'s specific claim is about relationship longevity, not engagement scores or 360 ratings.',
      },
      {
        id: 'ip-2',
        question: 'In the context of influencing behavior through feedback, what does the Radical Candor lesson identify as the most important variable?',
        options: [
          { id: 'A', text: 'The format — whether feedback is written or verbal' },
          { id: 'B', text: 'The setting — private vs. public feedback' },
          { id: 'C', text: 'The timing — giving feedback immediately rather than waiting for a formal meeting' },
          { id: 'D', text: 'The framing — using "I" statements instead of "you" statements' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. The Radical Candor lesson\'s central insight is about timing: "Most feedback happens too late, too formally, and with too much preamble." The 60-second rule is built on the idea that immediacy is what makes feedback feel like coaching rather than evaluation. A (format) is not identified as the key variable. B (private vs. public) is important but not what the lesson isolates. D (I vs. you statements) is a common communication framework but not the lesson\'s focus.',
      },
      {
        id: 'ip-3',
        question: 'What posture creates the most influence with your boss when bringing problems, according to the Managing Up lesson?',
        options: [
          { id: 'A', text: 'Coming with detailed documentation so the boss can make a fully informed decision' },
          { id: 'B', text: 'Asking the boss what they recommend before sharing your own view' },
          { id: 'C', text: 'Presenting the problem, three options, your recommendation, and asking for alignment — not permission' },
          { id: 'D', text: 'Framing problems in terms of risk to avoid being seen as negative' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. Jordan\'s formula: "Here\'s the problem, here are three ways I could handle it, here\'s what I recommend and why. You\'re not asking for permission. You\'re asking for alignment." This shifts the dynamic from subordinate-seeking-direction to peer-seeking-alignment, building influence through ownership and judgment. A (documentation) is thorough but passive — it still positions the boss as the decision-maker. B (ask first) abdicates ownership. D (risk framing) is a tactic, not the posture Jordan describes.',
      },
      {
        id: 'ip-4',
        question: 'The third shift in "The Art of Saying Hard Things" is about how you frame the opening of a difficult conversation. What makes this opening a powerful influencing move?',
        options: [
          { id: 'A', text: 'It puts the other person on notice, signaling the seriousness of the conversation' },
          { id: 'B', text: 'It names the relationship as the reason for the conversation — making honesty feel like investment, not judgment' },
          { id: 'C', text: 'It softens the message so the other person is more receptive' },
          { id: 'D', text: 'It establishes the manager\'s authority before delivering the message' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. The third shift reframes the entire conversation by naming the relationship as the reason ("I\'m bringing this up because I think you\'re capable of more"). The lesson notes: "That sentence does more work than any feedback framework ever invented." A (putting on notice) creates defensiveness. C (softening) mischaracterizes it — the message isn\'t softened, the frame is changed from judgment to investment. D (establishing authority) is antithetical to the collaborative, relationship-forward approach described.',
      },
      {
        id: 'ip-5',
        question: 'How does the Executive Presence lesson describe the influence mechanism behind "clarity over completeness"?',
        options: [
          { id: 'A', text: 'Brief messages are more likely to be read and remembered in busy organizations' },
          { id: 'B', text: 'Over-explaining signals uncertainty; conclusions-first with reasoning available reads as decisive and credible' },
          { id: 'C', text: 'Simplifying complex ideas makes them accessible to more stakeholders' },
          { id: 'D', text: 'Clarity reduces the risk of miscommunication across large teams' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. The lesson\'s first presence driver states: "Leaders without presence over-explain. They give you the whole journey when you need the destination. Leaders with presence give conclusions first, then reasoning if asked." Over-explanation signals that the leader isn\'t sure of their conclusion. Conclusions-first signals the thinking is done. The influence mechanism is the confidence signal embedded in communication structure. A (brevity for readability) is a different rationale. C (accessibility) is a communication principle, not the presence insight. D (reducing miscommunication) is a practical benefit, not the psychological mechanism identified.',
      },
      {
        id: 'ip-6',
        question: 'Kim Scott\'s Radical Candor framework defines the ideal as "care personally + challenge directly." What does the lesson say most managers actually deliver?',
        options: [
          { id: 'A', text: 'They deliver pure Radical Candor but the recipient experiences it as aggression' },
          { id: 'B', text: 'They get one axis right and miss the other — obnoxious aggression or ruinous empathy' },
          { id: 'C', text: 'They deliver manipulative insincerity — saying what people want to hear' },
          { id: 'D', text: 'They achieve the framework in one-on-ones but revert to ruinous empathy in group settings' },
        ],
        correctAnswer: 'B',
        explanation: 'The correct answer is B. The lesson: "most managers who\'ve read the book end up in obnoxious aggression — they got the challenge part, forgot the care. Or ruinous empathy — they care deeply, say nothing useful." Both failures result from mastering one dimension while losing the other. A is an interpretation not in the lesson. C (manipulative insincerity) is the worst quadrant but not the most common failure the lesson diagnoses. D (one-on-one vs. group nuance) is not in the lesson.',
      },
      {
        id: 'ip-7',
        question: 'The lesson on difficult conversations argues that leading with curiosity is superior to leading with conclusions. Why is curiosity a more effective influence strategy?',
        options: [
          { id: 'A', text: 'It allows the manager to gather more evidence before making a judgment' },
          { id: 'B', text: 'It reduces the legal risk of making premature performance conclusions' },
          { id: 'C', text: 'It signals genuine openness rather than a pre-written verdict, and may reveal context that changes the entire picture' },
          { id: 'D', text: 'It is less confrontational and therefore more likely to produce compliance' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. The lesson\'s second shift: "The best version starts with a genuine question — Help me understand what\'s been going on — and means it. You might learn something that changes everything." The influence mechanism is twofold: it signals genuine openness (lowering defensiveness) and might actually reveal context that reshapes the conversation. A (evidence-gathering) is a partial truth but misses the relational dimension. B (legal risk) is not mentioned. D (less confrontational) mischaracterizes curiosity as softness — the lesson emphasizes meaning it genuinely.',
      },
      {
        id: 'ip-8',
        question: 'Across the lessons, what is the common thread in how influential leaders communicate — whether giving feedback, managing up, or speaking in meetings?',
        options: [
          { id: 'A', text: 'They communicate more frequently than others, ensuring their perspective is always present' },
          { id: 'B', text: 'They adapt their style to match their audience\'s preferences' },
          { id: 'C', text: 'They say the thing clearly with conviction, back it with reasoning, and don\'t over-qualify or fill space' },
          { id: 'D', text: 'They use structured frameworks in all communications to signal rigor' },
        ],
        correctAnswer: 'C',
        explanation: 'The correct answer is C. This synthesizes the common thread: the third shift in difficult conversations (say the thing directly, framed in the relationship), the 60-second feedback rule (say it now, without excessive preamble), and executive presence drivers (clarity over completeness, selective speech, comfort with silence). In all cases, the influential move is saying the thing with conviction and not diluting it. A (frequency) is the opposite instinct — presence comes from saying less, not more. B (style-matching) is a flexibility skill, not the thread the lessons identify. D (frameworks) may provide structure but the lessons consistently point to authentic conviction.',
      },
    ],
  },
];
