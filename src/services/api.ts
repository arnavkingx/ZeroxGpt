import { ChatMessage, LanguagePreference, PersonalityType, ZeroxAction } from '../types';

export const HOST_OWNERS = 'Arnav Sharma and Akshit Kanswal';

export const PERSONALITY_PROMPTS: Record<PersonalityType, string> = {
  default:
    'You are Zerox GPT Nano, created and hosted by Arnav Sharma and Akshit Kanswal. Your answers are clear, intelligent, sharp, and helpful. You adapt to user preferences and offer proactive insights.',
  architect:
    'You are Zerox Code Architect, created by Arnav Sharma and Akshit Kanswal. You are an elite principal software engineer and systems architect. You prioritize clean architecture, correct typing, production-grade code, performance, and best practices.',
  tutor:
    'You are Zerox Academic Tutor, created by Arnav Sharma and Akshit Kanswal. You explain complex STEM, history, language, and conceptual topics using step-by-step intuition, analogies, and structured summaries.',
  writer:
    'You are Zerox Creative Writer, created by Arnav Sharma and Akshit Kanswal. You craft captivating stories, persuasive copy, evocative essays, and engaging scripts with style, rich vocabulary, and emotional resonance.',
  hinglish_buddy:
    'You are Zerox Hinglish Buddy, created and hosted by Arnav Sharma and Akshit Kanswal. You speak in natural, friendly Hinglish (a warm blend of Hindi and English written in Latin script, jaise ki "Haan bilkul, main abhi solve karta hoon!"). You are enthusiastic, smart, and relatable.',
};

export const LANGUAGE_INSTRUCTIONS: Record<LanguagePreference, string> = {
  en: 'Respond in clear, natural English.',
  hi: 'Respond primarily in standard Hindi (Devanagari script) or natural conversational Hindi as appropriate.',
  hinglish: 'Respond in natural, expressive Hinglish (Hindi written in Roman/English alphabet, popular across India).',
};

export function parseActionsFromContent(content: string): {
  cleanContent: string;
  actions: ZeroxAction[];
} {
  const actions: ZeroxAction[] = [];
  const actionRegex = /```json:action\s*([\s\S]*?)\s*```/g;
  let cleanContent = content;

  let match;
  while ((match = actionRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.type) {
        actions.push({
          id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: parsed.type,
          title: parsed.title || 'Zerox Action',
          data: parsed.data || {},
          status: 'pending',
        });
      }
    } catch (e) {
      console.warn('Failed to parse action json:', e);
    }
  }

  cleanContent = cleanContent.replace(actionRegex, '').trim();

  return { cleanContent, actions };
}

export async function testGeminiApiKey(apiKey?: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/test-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to authenticate Zerox Engine.' };
    }
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error while testing Zerox Engine key.' };
  }
}

export async function streamChatCompletion({
  messages,
  apiKey,
  model = 'Zerox GPT Nano',
  personality = 'default',
  language = 'en',
  abortSignal,
  onChunk,
  onError,
  onDone,
}: {
  messages: ChatMessage[];
  apiKey?: string;
  model?: string;
  personality?: PersonalityType;
  language?: LanguagePreference;
  abortSignal?: AbortSignal;
  onChunk: (accumulatedText: string) => void;
  onError: (error: string) => void;
  onDone: (fullText: string, actions: ZeroxAction[]) => void;
}): Promise<void> {
  try {
    const systemInstruction = [
      PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.default,
      LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en,
    ].join('\n\n');

    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['x-zerox-key'] = apiKey;
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: formattedMessages,
        model,
        systemInstruction,
        stream: true,
      }),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.error || `Server returned ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Unable to initialize response stream reader.');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.replace(/^data:\s*/, '');
        if (dataStr === '[DONE]') {
          const { cleanContent, actions } = parseActionsFromContent(accumulatedText);
          onDone(cleanContent, actions);
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.text) {
            accumulatedText += parsed.text;
            onChunk(accumulatedText);
          }
        } catch (e: any) {
          if (e.message && !e.message.includes('JSON')) {
            throw e;
          }
        }
      }
    }

    const { cleanContent, actions } = parseActionsFromContent(accumulatedText);
    onDone(cleanContent, actions);
  } catch (err: any) {
    if (err.name === 'AbortError') {
      onError('Generation stopped.');
    } else {
      console.error('streamChatCompletion error:', err);
      onError(err.message || 'An error occurred during response generation.');
    }
  }
}
