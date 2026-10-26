/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { MessageComposer } from './components/MessageComposer';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { SettingsModal } from './components/SettingsModal';
import { ToolsDrawer } from './components/ToolsDrawer';
import { AuthModal } from './components/AuthModal';
import { StorageService } from './services/storage';
import { streamChatCompletion } from './services/api';
import {
  ActiveTimer,
  ChatMessage,
  Conversation,
  PersonalityType,
  User,
  ZeroxAction,
} from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);

  useEffect(() => {
    const user = StorageService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadUserConversations(user.id);
    } else {
      const demoAccount = StorageService.loginUser('user@zerox.ai', 'zerox123');
      if (demoAccount.user) {
        setCurrentUser(demoAccount.user);
        loadUserConversations(demoAccount.user.id);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser?.id]);

  const loadUserConversations = (userId: string) => {
    const convs = StorageService.getConversations(userId);
    setConversations(convs);
    if (convs.length > 0) {
      setActiveConversationId(convs[0].id);
    } else {
      createNewWelcomeConversation(userId);
    }
  };

  const createNewWelcomeConversation = (userId: string) => {
    const welcomeConv: Conversation = {
      id: `conv_${Date.now()}`,
      userId,
      title: 'Welcome to Zerox GPT Nano',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg_welcome_${Date.now()}`,
          role: 'assistant',
          content:
            `## Hello! I'm Zerox GPT Nano\n\n` +
            `*Your Intelligence. Your World.*\n\n` +
            `Created and hosted by **Arnav Sharma** and **Akshit Kanswal**.\n\n` +
            `I'm your personal AI chatbot with lightning-fast streaming, multi-language fluency in English, Hindi, and Hinglish, hands-free voice assistant mode, and real-world actions.\n\n` +
            `Here are some things we can do together:\n` +
            `- **Code & Engineering:** Full-stack architecture, clean TypeScript, instant debugging, algorithms.\n` +
            `- **School & Academics:** Step-by-step conceptual explanations for STEM, history, languages.\n` +
            `- **Natural Hinglish:** "Bhai, machine learning kaise start karein?", relatable friendly responses.\n` +
            `- **Actions Hub:** Search YouTube, launch Google searches, draft WhatsApp messages, active countdown timers & reminders.\n` +
            `- **Voice Mode:** Tap **Voice Mode** above for hands-free speech with an animated plasma orb.\n\n` +
            `How can I assist you today?`,
          timestamp: Date.now(),
        },
      ],
      model: currentUser?.selectedModel || 'Zerox GPT Nano',
      personality: currentUser?.personality || 'default',
    };

    StorageService.saveSingleConversation(userId, welcomeConv);
    setConversations([welcomeConv]);
    setActiveConversationId(welcomeConv.id);
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const handleNewChat = () => {
    if (!currentUser) return;
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      userId: currentUser.id,
      title: 'New chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      model: currentUser.selectedModel || 'Zerox GPT Nano',
      personality: currentUser.personality || 'default',
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveConversationId(newConv.id);
    StorageService.saveConversations(currentUser.id, updated);
  };

  const handleDeleteConversation = (id: string) => {
    if (!currentUser) return;
    const updated = StorageService.deleteConversation(currentUser.id, id);
    setConversations(updated);
    if (activeConversationId === id) {
      setActiveConversationId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    if (!currentUser) return;
    const updated = conversations.map((c) => (c.id === id ? { ...c, title: newTitle } : c));
    setConversations(updated);
    StorageService.saveConversations(currentUser.id, updated);
  };

  const handleTogglePin = (id: string) => {
    if (!currentUser) return;
    const updated = conversations.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c));
    setConversations(updated);
    StorageService.saveConversations(currentUser.id, updated);
  };

  const handleClearHistory = () => {
    if (!currentUser) return;
    StorageService.clearAllConversations(currentUser.id);
    setConversations([]);
    setActiveConversationId(null);
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = StorageService.updateUserProfile(currentUser.id, updates);
    if (updated) {
      setCurrentUser(updated);
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    loadUserConversations(user.id);
  };

  const handleLogout = () => {
    StorageService.logoutUser();
    setCurrentUser(null);
    setConversations([]);
    setActiveConversationId(null);
    setIsAuthOpen(true);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !currentUser || isStreaming) return;

    let targetConv = activeConversation;

    if (!targetConv) {
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        userId: currentUser.id,
        title: text.length > 28 ? `${text.substring(0, 28)}...` : text,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        model: currentUser.selectedModel || 'Zerox GPT Nano',
        personality: currentUser.personality || 'default',
      };
      targetConv = newConv;
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
    }

    const isFirstUserMsg = targetConv.messages.length === 0 || targetConv.title === 'New chat';
    const newTitle = isFirstUserMsg
      ? text.length > 32
        ? `${text.substring(0, 32)}...`
        : text
      : targetConv.title;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantPlaceholder: ChatMessage = {
      id: `msg_asst_${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      isStreaming: true,
    };

    const updatedMessages = [...targetConv.messages, userMessage, assistantPlaceholder];

    const updatedConv: Conversation = {
      ...targetConv,
      title: newTitle,
      updatedAt: Date.now(),
      messages: updatedMessages,
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === updatedConv.id ? updatedConv : c))
    );

    setIsStreaming(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    await streamChatCompletion({
      messages: [...targetConv.messages, userMessage],
      apiKey: currentUser.customApiKey || undefined,
      model: currentUser.selectedModel || 'Zerox GPT Nano',
      personality: currentUser.personality || 'default',
      language: currentUser.preferredLanguage || 'en',
      abortSignal: abortController.signal,
      onChunk: (accumulated) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== updatedConv.id) return c;
            const msgs = [...c.messages];
            const last = msgs[msgs.length - 1];
            if (last && last.role === 'assistant') {
              msgs[msgs.length - 1] = {
                ...last,
                content: accumulated,
                isStreaming: true,
              };
            }
            return { ...c, messages: msgs };
          })
        );
      },
      onError: (errMsg) => {
        setIsStreaming(false);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== updatedConv.id) return c;
            const msgs = [...c.messages];
            const last = msgs[msgs.length - 1];
            if (last && last.role === 'assistant') {
              msgs[msgs.length - 1] = {
                ...last,
                content:
                  last.content ||
                  `⚠️ **Notice:** ${errMsg}\n\n*Tip: Check connection in Settings.*`,
                isStreaming: false,
                error: true,
              };
            }
            return { ...c, messages: msgs };
          })
        );
      },
      onDone: (fullText, actions) => {
        setIsStreaming(false);
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== updatedConv.id) return c;
            const msgs = [...c.messages];
            const last = msgs[msgs.length - 1];
            if (last && last.role === 'assistant') {
              msgs[msgs.length - 1] = {
                ...last,
                content: fullText,
                isStreaming: false,
                actions: actions.length > 0 ? actions : undefined,
              };
            }
            return { ...c, messages: msgs };
          });
          if (currentUser) {
            StorageService.saveConversations(currentUser.id, updated);
          }
          return updated;
        });

        if (currentUser.autoSpeak && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const cleanSpeech = fullText
            .replace(/```[\s\S]*?```/g, '')
            .replace(/[*#_`>]/g, '')
            .trim();
          if (cleanSpeech) {
            const utterance = new SpeechSynthesisUtterance(cleanSpeech);
            window.speechSynthesis.speak(utterance);
          }
        }
      },
    });
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleRegenerate = () => {
    if (!activeConversation || isStreaming) return;
    const msgs = activeConversation.messages;
    if (msgs.length === 0) return;

    let lastUserText = '';
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserText = msgs[i].content;
        break;
      }
    }

    if (!lastUserText) return;

    const sliced = msgs.filter((_, idx) => idx !== msgs.length - 1);
    const updatedConv = { ...activeConversation, messages: sliced };
    setConversations((prev) =>
      prev.map((c) => (c.id === updatedConv.id ? updatedConv : c))
    );

    handleSendMessage(lastUserText);
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    if (!activeConversation || isStreaming) return;
    const msgs = activeConversation.messages;
    const targetIdx = msgs.findIndex((m) => m.id === messageId);
    if (targetIdx === -1) return;

    const pruned = msgs.slice(0, targetIdx);
    const updatedConv = { ...activeConversation, messages: pruned };
    setConversations((prev) =>
      prev.map((c) => (c.id === updatedConv.id ? updatedConv : c))
    );

    handleSendMessage(newText);
  };

  const handleSendVoiceMessage = async (text: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!currentUser) {
        reject(new Error('User not authenticated'));
        return;
      }

      handleSendMessage(text);

      const checkInterval = setInterval(() => {
        setConversations((currentConvs) => {
          const c = currentConvs.find((item) => item.id === activeConversationId);
          if (c && c.messages.length > 0) {
            const last = c.messages[c.messages.length - 1];
            if (last.role === 'assistant' && !last.isStreaming && last.content) {
              clearInterval(checkInterval);
              resolve(last.content);
            }
          }
          return currentConvs;
        });
      }, 500);

      setTimeout(() => {
        clearInterval(checkInterval);
        resolve("I've formulated my response in your chat window!");
      }, 30000);
    });
  };

  const handleCreateTimerFromAction = (label: string, minutes: number) => {
    const newTimer: ActiveTimer = {
      id: `timer_${Date.now()}`,
      label,
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      isRunning: true,
      startedAt: Date.now(),
    };
    setActiveTimers((prev) => [newTimer, ...prev]);
    setIsToolsOpen(true);
  };

  const handleCreateReminderFromAction = (text: string, time: string) => {
    if (!currentUser) return;
    const currentReminders = StorageService.getReminders(currentUser.id);
    const newRem = {
      id: `rem_${Date.now()}`,
      text,
      dueTime: time,
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      createdAt: Date.now(),
    };
    StorageService.saveReminders(currentUser.id, [newRem, ...currentReminders]);
    setIsToolsOpen(true);
  };

  const handleCreateNoteFromAction = (title: string, content: string) => {
    if (!currentUser) return;
    const currentNotes = StorageService.getNotes(currentUser.id);
    const newNote = {
      id: `note_${Date.now()}`,
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    StorageService.saveNotes(currentUser.id, [newNote, ...currentNotes]);
    setIsToolsOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900 font-sans">
      {/* ChatGPT-Style White Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePin={handleTogglePin}
        currentUser={currentUser}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTools={() => setIsToolsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Chat Canvas (Pure White like ChatGPT) */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative bg-white">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenToolsDrawer={() => setIsToolsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          currentUser={currentUser}
          selectedModel={currentUser?.selectedModel || 'Zerox GPT Nano'}
        />

        <ChatArea
          messages={activeConversation?.messages || []}
          isStreaming={isStreaming}
          onSendMessage={handleSendMessage}
          onRegenerate={handleRegenerate}
          onEditMessage={handleEditMessage}
          currentUser={currentUser}
          onCreateTimer={handleCreateTimerFromAction}
          onCreateReminder={handleCreateReminderFromAction}
          onCreateNote={handleCreateNoteFromAction}
        />

        <MessageComposer
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStopGeneration={handleStopGeneration}
          preferredLanguage={currentUser?.preferredLanguage || 'en'}
          personality={currentUser?.personality || 'default'}
        />
      </div>

      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentUser={currentUser}
        onSendVoiceMessage={handleSendVoiceMessage}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onClearHistory={handleClearHistory}
      />

      <ToolsDrawer
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        currentUser={currentUser}
        activeTimers={activeTimers}
        setActiveTimers={setActiveTimers}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
