export type LanguagePreference = 'en' | 'hi' | 'hinglish';

export type PersonalityType =
  | 'default'
  | 'architect'
  | 'tutor'
  | 'writer'
  | 'hinglish_buddy';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferredLanguage?: LanguagePreference;
  preferredVoice?: string;
  customApiKey?: string;
  selectedModel?: string;
  autoSpeak?: boolean;
  personality?: PersonalityType;
  createdAt: number;
}

export interface ZeroxAction {
  id: string;
  type:
    | 'youtube_search'
    | 'google_search'
    | 'whatsapp_message'
    | 'maps_navigate'
    | 'open_reels'
    | 'open_shorts'
    | 'create_timer'
    | 'create_reminder'
    | 'create_note'
    | 'android_call'
    | 'android_scroll';
  title: string;
  data: Record<string, any>;
  status: 'pending' | 'confirmed' | 'executed' | 'cancelled';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: boolean;
  actions?: ZeroxAction[];
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  pinned?: boolean;
  model?: string;
  personality?: PersonalityType;
}

export interface ActiveTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  startedAt?: number;
}

export interface ReminderItem {
  id: string;
  text: string;
  dueTime: string;
  dueDate: string;
  completed: boolean;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}
