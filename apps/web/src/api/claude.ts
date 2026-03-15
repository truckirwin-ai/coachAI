import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  const stored = JSON.parse(localStorage.getItem('coach_settings') || '{}');
  const apiKey = stored.anthropicApiKey || import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

const COACH_SYSTEM_PROMPT = `You are an expert AI business coach. You are warm, direct, Socratic, and professional. You help business professionals develop real leadership and management skills through structured coaching conversations.

Your coaching style:
- Ask powerful questions rather than giving lectures
- Reflect back what you hear to deepen insight
- Challenge assumptions gently but directly
- Offer specific, actionable frameworks when appropriate
- Keep responses concise — 2-4 sentences typically, never more than 6
- You are never preachy, never generic, never corporate
- You care about the person's actual growth, not just making them feel good

Current session context will be provided in the user message.`;

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendCoachMessage(
  messages: ClaudeMessage[],
  skillName: string,
  sessionType: string,
  onToken: (token: string) => void,
  systemOverride?: string
): Promise<string> {
  const systemPrompt = systemOverride || `${COACH_SYSTEM_PROMPT}\n\nCurrent skill: ${skillName}\nSession type: ${sessionType}`;

  let fullResponse = '';

  const stream = getClient().messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 300,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullResponse += chunk.delta.text;
      onToken(chunk.delta.text);
    }
  }

  return fullResponse;
}
