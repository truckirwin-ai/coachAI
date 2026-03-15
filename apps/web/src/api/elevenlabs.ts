function getElevenLabsKey(): string {
  const stored = JSON.parse(localStorage.getItem('coach_settings') || '{}');
  return stored.elevenLabsApiKey || import.meta.env.VITE_ELEVENLABS_API_KEY || '';
}

// Voice ID map — mature voices, 45–65 yrs, guiding / mentoring / humble tone
// George  JBFqnCBsd6RMkjVDRZzb — warm captivating storyteller, middle-aged male
// Bill    pqHfZKP75CvOlQylNhV4 — wise, mature, balanced, older male
// Daniel  onwK4e9ZLuTAKqWW03F9 — steady broadcaster, middle-aged male
// Alice   Xb7hH8MSUJpSbSDYk0k2 — clear engaging educator, middle-aged female
// Matilda XrExE9yKIg1WjnnlVkGX — knowledgeable professional, middle-aged female
// Bella   hpp4J3VqNfWAUOO0d1Us — professional warm, middle-aged female
// Eric    cjVigY5qzO86Huf0OWal — smooth trustworthy, middle-aged male
// Brian   nPczCjzI2devNBz1zQrb — deep resonant comforting, middle-aged male
// River   SAz9YHcvj6GT2YYXdXww — relaxed neutral informative, middle-aged neutral
// Lily    pFZP5JQG7iQjIQuC4Bku — velvety storyteller, middle-aged female
// Chris   iP95p4xoKVk53GoZ742B — charming down-to-earth, middle-aged male
// Roger   CwhRBWXzGAHq8TQ4Fs17 — laid-back resonant, middle-aged male
export const VOICE_IDS: Record<string, string> = {
  narrator:      'JBFqnCBsd6RMkjVDRZzb', // George  — warm, captivating, middle-aged male
  narrator_ted2: 'XrExE9yKIg1WjnnlVkGX', // Matilda — knowledgeable, middle-aged female
  narrator_ted3: 'pqHfZKP75CvOlQylNhV4', // Bill    — wise, mature, older male
  Alex_bella:    'hpp4J3VqNfWAUOO0d1Us', // Bella   — professional warm, middle-aged female
  Jordan:        'onwK4e9ZLuTAKqWW03F9', // Daniel  — steady, middle-aged male
  Alex_sarah:    'Xb7hH8MSUJpSbSDYk0k2', // Alice   — educator, middle-aged female
  Sam:           'iP95p4xoKVk53GoZ742B', // Chris   — charming, middle-aged male
  Alex_liam:     'SAz9YHcvj6GT2YYXdXww', // River   — relaxed neutral, middle-aged
  Morgan:        'pFZP5JQG7iQjIQuC4Bku', // Lily    — velvety storyteller, middle-aged female
  Casey:         'nPczCjzI2devNBz1zQrb', // Brian   — comforting, middle-aged male
  Dana:          'hpp4J3VqNfWAUOO0d1Us', // Bella   — warm, middle-aged female
  Marcus:        'cjVigY5qzO86Huf0OWal', // Eric    — smooth trustworthy, middle-aged male
  Reed:          'nPczCjzI2devNBz1zQrb', // Brian   — deep resonant, middle-aged male
  Jordan_host:   'onwK4e9ZLuTAKqWW03F9', // Daniel  — steady broadcaster
  Priya:         'XrExE9yKIg1WjnnlVkGX', // Matilda — professional, middle-aged female
  Tyler:         'iP95p4xoKVk53GoZ742B', // Chris   — charming, middle-aged male
  Devon:         'CwhRBWXzGAHq8TQ4Fs17', // Roger   — laid-back resonant, middle-aged male
  Sam_host:      'JBFqnCBsd6RMkjVDRZzb', // George  — warm storyteller, middle-aged male
  James:         'cjVigY5qzO86Huf0OWal', // Eric    — smooth trustworthy, middle-aged male
  Laura:         'Xb7hH8MSUJpSbSDYk0k2', // Alice   — educator, middle-aged female
  coach:         'JBFqnCBsd6RMkjVDRZzb', // George  — warm, guiding, middle-aged male
  host:          'hpp4J3VqNfWAUOO0d1Us', // Bella   — professional warm, middle-aged female
};

// ── Playback state ────────────────────────────────────────────────────────────
let currentAudio: HTMLAudioElement | null = null;
// abortPlayback reserved for future use

export function stopCurrentAudio() {
  
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}

// ── Cache ─────────────────────────────────────────────────────────────────────
const audioCache = new Map<string, string>();

export async function generateSpeech(text: string, voiceId: string): Promise<string> {
  const cacheKey = `${voiceId}:${text}`;
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey)!;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': getElevenLabsKey(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: {
          stability: 0.68,       // measured, calm — less variation = more mentor-like
          similarity_boost: 0.78,
          style: 0.18,           // subtle delivery — humble, not performative
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(cacheKey, url);
  return url;
}

export function playAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => { currentAudio = null; resolve(); };
    audio.onerror = reject;
    audio.play().catch(reject);
  });
}

// ── Sentence splitter ─────────────────────────────────────────────────────────
// Splits on sentence-ending punctuation followed by whitespace or end-of-string
export function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// ── Streaming TTS pipeline ────────────────────────────────────────────────────
// Feeds sentences to ElevenLabs as they arrive from Claude, plays them in order.
// Returns a controller object so the caller can abort mid-stream.
export interface TTSController {
  push: (sentence: string) => void;  // queue a sentence for TTS
  finish: () => void;                 // signal no more sentences coming
  abort: () => void;                  // stop everything immediately
}

export function createTTSPipeline(
  voiceId: string,
  onStart: () => void,       // fired when first audio starts playing
  onDone: () => void,        // fired when all audio has finished (or aborted)
): TTSController {
  const queue: string[] = [];
  let finished = false;     // no more sentences coming from Claude
  let playing = false;      // currently playing audio
  let aborted = false;

  async function drain() {
    if (playing || aborted) return;
    if (queue.length === 0) {
      if (finished) onDone();
      return;
    }
    playing = true;
    const sentence = queue.shift()!;

    try {
      // Pre-fetch while previous audio is playing (already done above via pre-fetch)
      const url = await generateSpeech(sentence, voiceId);
      if (aborted) { onDone(); return; }
      if (queue.length === 0 && !finished) {
        // More might come — play and continue draining
      }
      onStart();
      await playAudio(url);
    } catch {
      // TTS failure for this sentence — skip it
    }

    playing = false;
    if (!aborted) drain();
  }

  // Pre-fetch next sentence while current is playing
  async function prefetch() {
    if (queue.length > 0) {
      const next = queue[0];
      generateSpeech(next, voiceId).catch(() => {});
    }
  }

  return {
    push(sentence: string) {
      if (aborted) return;
      queue.push(sentence);
      prefetch();
      drain();
    },
    finish() {
      finished = true;
      if (!playing && queue.length === 0) onDone();
    },
    abort() {
      aborted = true;
      
      stopCurrentAudio();
      onDone();
    },
  };
}

export function pauseCurrentAudio() {
  if (currentAudio) currentAudio.pause();
}

export function resumeCurrentAudio() {
  if (currentAudio) currentAudio.play();
}
