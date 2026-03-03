function getElevenLabsKey(): string {
  const stored = JSON.parse(localStorage.getItem('coach_settings') || '{}');
  return stored.elevenLabsApiKey || import.meta.env.VITE_ELEVENLABS_API_KEY || '';
}

// Voice ID map
export const VOICE_IDS: Record<string, string> = {
  narrator: 'cgSgspJ2msm6clMCkdW9',
  narrator_ted2: 'XrExE9yKIg1WjnnlVkGX',
  narrator_ted3: 'cjVigY5qzO86Huf0OWal',
  Alex_bella: 'hpp4J3VqNfWAUOO0d1Us',
  Jordan: 'bIHbv24MWmeRgasZH58o',
  Alex_sarah: 'EXAVITQu4vr4xnSDxMaL',
  Sam: 'iP95p4xoKVk53GoZ742B',
  Alex_liam: 'TX3LPaxmHKxFdv7VOQHJ',
  Morgan: 'FGY2WhTYpPnrIDTdsKH5',
  Casey: 'bIHbv24MWmeRgasZH58o',
  Dana: 'hpp4J3VqNfWAUOO0d1Us',
  Marcus: 'cjVigY5qzO86Huf0OWal',
  Reed: 'nPczCjzI2devNBz1zQrb',
  Jordan_host: 'TX3LPaxmHKxFdv7VOQHJ',
  Priya: 'XrExE9yKIg1WjnnlVkGX',
  Tyler: 'iP95p4xoKVk53GoZ742B',
  Devon: 'CwhRBWXzGAHq8TQ4Fs17',
  Sam_host: 'cgSgspJ2msm6clMCkdW9',
  James: 'cjVigY5qzO86Huf0OWal',
  Laura: 'FGY2WhTYpPnrIDTdsKH5',
  coach: 'cgSgspJ2msm6clMCkdW9',
  host: 'hpp4J3VqNfWAUOO0d1Us',
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
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.4,
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
