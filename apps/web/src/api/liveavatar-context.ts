
import { useSessionStore } from '../store/sessionStore';
import { useUserStore } from '../store/userStore';
import { coachPersona } from '../data/coachPersona';

// LiveAvatar API configuration
// const _LIVEAVATAR_API_URL = 'https://api.liveavatar.com/v1';
const AVATAR_ID = 'e8ef20d6-0a8c-4b76-94f5-aa34b973a972';

/**
 * Creates a context for the LiveAvatar session.
 * 
 * NOTE: This function is not yet implemented, as the LiveAvatar API
 * documentation for context creation is incomplete. When the API is
 * available, this function should make a POST request to
 * /v1/contexts with the system prompt and other context.
 * 
 * @param systemPrompt The system prompt for the coach.
 * @returns The ID of the created context.
 */
async function createLiveAvatarContext(_systemPrompt: string): Promise<string> {
  // const apiKey = process.env.LIVEAVATAR_API_KEY;
  // const response = await fetch(`${LIVEAVATAR_API_URL}/contexts`, {
  //   method: 'POST',
  //   headers: {
  //     'X-API-KEY': apiKey,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ system_prompt: systemPrompt }),
  // });
  // const data = await response.json();
  // return data.context_id;

  // For now, return a placeholder
  return 'placeholder-context-id';
}


/**
 * Builds the avatar_persona object for the LiveAvatar session token.
 * 
 * This function pulls the current session and user state, builds the
 * system prompt, and (eventually) creates a LiveAvatar context.
 * 
 * @returns The avatar_persona object for the session token request.
 */
export async function buildAvatarPersona() {
  const { skillName, skillDomain } = useSessionStore.getState();
  const { name, role, industry, focusArea } = useUserStore.getState();

  // Replace placeholders in the system prompt
  const systemPrompt = coachPersona.systemPrompt
    .replace('{{skillDomain}}', skillDomain)
    .replace('{{skillName}}', skillName)
    .replace('{{userRole}}', role)
    .replace('{{userIndustry}}', industry)
    .replace('{{userName}}', name)
    .replace('{{userFocusArea}}', focusArea);

  // When the LiveAvatar API is available, this will create a new context
  // for each session with the dynamic system prompt.
  const contextId = await createLiveAvatarContext(systemPrompt);

  return {
    avatar_id: AVATAR_ID,
    avatar_persona: {
      voice_id: 'default-voice-id', // TODO: Make this configurable
      context_id: contextId,
      language: 'en',
    },
  };
}
