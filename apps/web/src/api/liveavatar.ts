import type { CoachDef } from '../data/coaches';

const VITE_LIVEAVATAR_API_KEY = import.meta.env.VITE_LIVEAVATAR_API_KEY;

export interface SessionInfo {
  session_id: string;
  session_token: string;
}

// Only fetches the session token. The SDK handles /sessions/start internally via session.start().
export async function createAvatarSession(coach: CoachDef): Promise<SessionInfo> {
  if (!VITE_LIVEAVATAR_API_KEY) {
    throw new Error('VITE_LIVEAVATAR_API_KEY is not set');
  }

  const response = await fetch('https://api.liveavatar.com/v1/sessions/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'X-API-KEY': VITE_LIVEAVATAR_API_KEY,
    },
    body: JSON.stringify({
      mode: 'CUSTOM',   // CUSTOM = no HeyGen LLM; USER_TRANSCRIPTION → our Claude pipeline
      avatar_id: coach.avatarId,
      avatar_persona: { language: 'en' },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to create session token: ${JSON.stringify(errorData)}`);
  }

  const tokenResponse = await response.json();
  const { session_token, session_id } = tokenResponse.data ?? tokenResponse;
  return { session_id, session_token };
}
