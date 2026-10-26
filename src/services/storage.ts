import { User, Conversation, NoteItem, ReminderItem } from '../types';

const STORAGE_PREFIX = 'zerox_';
const USERS_KEY = `${STORAGE_PREFIX}users`;
const CURRENT_USER_KEY = `${STORAGE_PREFIX}current_user_id`;

// Default demo account
const DEFAULT_USER: User = {
  id: 'usr_demo_zerox',
  email: 'user@zerox.ai',
  name: 'Alex Mercer',
  avatar: 'ZM',
  preferredLanguage: 'en',
  personality: 'default',
  selectedModel: 'Zerox GPT Nano',
  autoSpeak: false,
  createdAt: Date.now(),
};

interface StoredAccount extends User {
  passwordHash: string;
}

// Simple deterministic hash simulation for local account authentication
function hashPassword(pass: string): string {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    const char = pass.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}_${pass.length}`;
}

export const StorageService = {
  // --- USERS & AUTH ---
  getAllAccounts(): StoredAccount[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (!data) {
        // Initialize default user
        const initial = [
          {
            ...DEFAULT_USER,
            passwordHash: hashPassword('zerox123'),
          },
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  getCurrentUser(): User | null {
    try {
      const currentId = localStorage.getItem(CURRENT_USER_KEY);
      const accounts = this.getAllAccounts();
      if (currentId) {
        const found = accounts.find((a) => a.id === currentId);
        if (found) {
          const { passwordHash, ...user } = found;
          return user;
        }
      }
      // If none selected, return default
      if (accounts.length > 0) {
        const { passwordHash, ...user } = accounts[0];
        localStorage.setItem(CURRENT_USER_KEY, user.id);
        return user;
      }
      return null;
    } catch {
      return null;
    }
  },

  setCurrentUser(userId: string): void {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  },

  logoutUser(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  registerUser(name: string, email: string, pass: string): { success: boolean; user?: User; error?: string } {
    const accounts = this.getAllAccounts();
    const cleanEmail = email.trim().toLowerCase();
    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: StoredAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: name.trim() || 'Zerox User',
      avatar: (name.trim() || 'ZU').substring(0, 2).toUpperCase(),
      preferredLanguage: 'en',
      personality: 'default',
      selectedModel: 'Zerox GPT Nano',
      autoSpeak: false,
      createdAt: Date.now(),
      passwordHash: hashPassword(pass),
    };

    accounts.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);

    const { passwordHash, ...user } = newUser;
    return { success: true, user };
  },

  loginUser(email: string, pass: string): { success: boolean; user?: User; error?: string } {
    const accounts = this.getAllAccounts();
    const cleanEmail = email.trim().toLowerCase();
    const found = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (found.passwordHash !== hashPassword(pass)) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    localStorage.setItem(CURRENT_USER_KEY, found.id);
    const { passwordHash, ...user } = found;
    return { success: true, user };
  },

  resetPassword(email: string, newPass: string): { success: boolean; error?: string } {
    const accounts = this.getAllAccounts();
    const cleanEmail = email.trim().toLowerCase();
    const idx = accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);

    if (idx === -1) {
      return { success: false, error: 'No account found with this email.' };
    }

    accounts[idx].passwordHash = hashPassword(newPass);
    localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
    return { success: true };
  },

  updateUserProfile(userId: string, updates: Partial<User>): User | null {
    const accounts = this.getAllAccounts();
    const idx = accounts.findIndex((a) => a.id === userId);
    if (idx === -1) return null;

    accounts[idx] = { ...accounts[idx], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(accounts));

    const { passwordHash, ...user } = accounts[idx];
    return user;
  },

  // --- CONVERSATIONS (SCOPED PER USER) ---
  getConversations(userId: string): Conversation[] {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}convs_${userId}`);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveConversations(userId: string, convs: Conversation[]): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}convs_${userId}`, JSON.stringify(convs));
    } catch (e) {
      console.error('Failed to save conversations', e);
    }
  },

  saveSingleConversation(userId: string, conv: Conversation): void {
    const convs = this.getConversations(userId);
    const idx = convs.findIndex((c) => c.id === conv.id);
    if (idx >= 0) {
      convs[idx] = conv;
    } else {
      convs.unshift(conv);
    }
    this.saveConversations(userId, convs);
  },

  deleteConversation(userId: string, convId: string): Conversation[] {
    const convs = this.getConversations(userId);
    const filtered = convs.filter((c) => c.id !== convId);
    this.saveConversations(userId, filtered);
    return filtered;
  },

  clearAllConversations(userId: string): void {
    localStorage.removeItem(`${STORAGE_PREFIX}convs_${userId}`);
  },

  // --- NOTES (SCOPED PER USER) ---
  getNotes(userId: string): NoteItem[] {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}notes_${userId}`);
      if (!data) {
        return [
          {
            id: 'note_welcome',
            title: 'Welcome to Zerox GPT',
            content: 'Zerox GPT lets you organize ideas, code snippets, and research seamlessly.',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            pinned: true,
          },
        ];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveNotes(userId: string, notes: NoteItem[]): void {
    localStorage.setItem(`${STORAGE_PREFIX}notes_${userId}`, JSON.stringify(notes));
  },

  // --- REMINDERS (SCOPED PER USER) ---
  getReminders(userId: string): ReminderItem[] {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}reminders_${userId}`);
      if (!data) {
        return [
          {
            id: 'rem_1',
            text: 'Explore Zerox Voice Mode & Actions',
            dueTime: '18:00',
            dueDate: new Date().toISOString().split('T')[0],
            completed: false,
            createdAt: Date.now(),
          },
        ];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveReminders(userId: string, reminders: ReminderItem[]): void {
    localStorage.setItem(`${STORAGE_PREFIX}reminders_${userId}`, JSON.stringify(reminders));
  },
};
