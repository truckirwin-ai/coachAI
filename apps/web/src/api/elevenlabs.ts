function getElevenLabsKey(): string {
  const stored = JSON.parse(localStorage.getItem('coach_settings') || '{}');
  return stored.elevenLabsApiKey || import.meta.env.VITE_ELEVENLABS_API_KEY || '';
}

// Voice ID map
export const VOICE_IDS: Record<string, string> = {
  // TED Talk narrators
  narrator: 'cgSgspJ2msm6clMCkdW9',   // Jessica - Playful, Bright, Warm (female, american)
  narrator_ted2: 'XrExE9yKIg1WjnnlVkGX', // Matilda - Knowledgeable, Professional (female, american)
  narrator_ted3: 'cjVigY5qzO86Huf0OWal', // Eric - Smooth, Trustworthy (male, american)

  // Podcast hosts/guests - always male+female pairs
  // Managing Up: Bella (host/Alex, female) + Will (guest/Jordan, male)
  Alex_bella: 'hpp4J3VqNfWAUOO0d1Us',  // Bella - Professional, Bright, Warm (female)
  Jordan: 'bIHbv24MWmeRgasZH58o',      // Will - Relaxed Optimist (male)

  // Delegation: Sarah (host/Alex, female) + Chris (guest/Sam, male)
  Alex_sarah: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Mature, Reassuring (female)
  Sam: 'iP95p4xoKVk53GoZ742B',         // Chris - Charming, Down-to-Earth (male)

  // Strategy: Liam (host/Alex, male) + Laura (guest/Morgan, female)
  Alex_liam: 'TX3LPaxmHKxFdv7VOQHJ',  // Liam - Energetic (male)
  Morgan: 'FGY2WhTYpPnrIDTdsKH5',      // Laura - Enthusiast, Quirky (female)

  // New podcast voices
  Casey: 'bIHbv24MWmeRgasZH58o',       // Will - Relaxed Optimist (male)
  Dana: 'hpp4J3VqNfWAUOO0d1Us',        // Bella - Professional, Bright, Warm (female)
  Marcus: 'cjVigY5qzO86Huf0OWal',      // Eric - Smooth, Trustworthy (male)
  Reed: 'nPczCjzI2devNBz1zQrb',        // Brian - authoritative (male)
  Jordan_host: 'TX3LPaxmHKxFdv7VOQHJ', // Liam - Energetic (male)
  Priya: 'XrExE9yKIg1WjnnlVkGX',       // Matilda - Knowledgeable (female)
  Tyler: 'iP95p4xoKVk53GoZ742B',       // Chris - Charming (male)
  Devon: 'CwhRBWXzGAHq8TQ4Fs17',       // Roger - Deep, Calm (male)
  Sam_host: 'cgSgspJ2msm6clMCkdW9',    // Jessica - Playful, Warm (female)
  James: 'cjVigY5qzO86Huf0OWal',       // Eric - Smooth, Trustworthy (male)
  Laura: 'FGY2WhTYpPnrIDTdsKH5',       // Laura - Enthusiast (female)

  // AI coaching session voice
  coach: 'cgSgspJ2msm6clMCkdW9',       // Jessica - warm, upbeat, american
  host: 'hpp4J3VqNfWAUOO0d1Us',        // Bella - default podcast host
};

// Cache: avoid re-generating same text
const audioCache = new Map<string, string>(); // text+voiceId -> object URL

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

// Play audio and return a promise that resolves when done
export function playAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = reject;
    audio.play().catch(reject);
    (window as any).__coachAICurrentAudio = audio;
  });
}

export function stopCurrentAudio() {
  const audio = (window as any).__coachAICurrentAudio as HTMLAudioElement | undefined;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

export function pauseCurrentAudio() {
  const audio = (window as any).__coachAICurrentAudio as HTMLAudioElement | undefined;
  if (audio) audio.pause();
}

export function resumeCurrentAudio() {
  const audio = (window as any).__coachAICurrentAudio as HTMLAudioElement | undefined;
  if (audio) audio.play();
}
