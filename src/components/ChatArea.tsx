import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  Edit2,
  Code,
  GraduationCap,
  PenTool,
  Globe2,
  Youtube,
  MessageCircle,
} from 'lucide-react';
import { ChatMessage, PersonalityType, User, ZeroxAction } from '../types';
import { ZeroxOrb } from './ZeroxOrb';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ActionCard } from './ActionCard';

interface ChatAreaProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onRegenerate: () => void;
  onEditMessage: (messageId: string, newText: string) => void;
  currentUser: User | null;
  onActionExecute?: (action: ZeroxAction) => void;
  onCreateTimer?: (label: string, min: number) => void;
  onCreateReminder?: (text: string, time: string) => void;
  onCreateNote?: (title: string, content: string) => void;
  onSelectPersonality?: (p: PersonalityType) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  onRegenerate,
  onEditMessage,
  currentUser,
  onActionExecute,
  onCreateTimer,
  onCreateReminder,
  onCreateNote,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!synthRef.current) return;

    if (speakingMsgId === id) {
      synthRef.current.cancel();
      setSpeakingMsgId(null);
      return;
    }

    synthRef.current.cancel();
    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*#_`>]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .trim();

    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(id);
    synthRef.current.speak(utterance);
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setEditText(msg.content);
  };

  const submitEdit = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim()) {
      onEditMessage(id, editText.trim());
      setEditingMsgId(null);
    }
  };

  const promptSuggestions = [
    {
      icon: Code,
      category: 'Coding',
      label: 'Build a Next.js fullstack auth component with TypeScript',
      color: 'text-cyan-700',
    },
    {
      icon: GraduationCap,
      category: 'School Help',
      label: 'Explain Quantum Entanglement simply with everyday analogies',
      color: 'text-blue-700',
    },
    {
      icon: Globe2,
      category: 'Hinglish Mode',
      label: 'Bhai, machine learning kaise start karein? Step-by-step roadmap batao.',
      color: 'text-amber-700',
    },
    {
      icon: Youtube,
      category: 'Zerox Action',
      label: 'Search YouTube for best lo-fi music for deep focus study',
      color: 'text-rose-700',
    },
    {
      icon: PenTool,
      category: 'Writing',
      label: 'Write a persuasive email proposing an AI chatbot workflow',
      color: 'text-emerald-700',
    },
    {
      icon: MessageCircle,
      category: 'Smart Action',
      label: 'Prepare a WhatsApp message to team for tomorrow morning sync',
      color: 'text-teal-700',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 select-text bg-white">
      {messages.length === 0 ? (
        /* ChatGPT-style clean empty state */
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[68vh] text-center select-none py-6">
          <div className="relative mb-4 flex items-center justify-center">
            <ZeroxOrb size="lg" state="idle" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              Zerox GPT
            </h1>
            <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-mono">
              Nano
            </span>
          </div>

          <p className="text-sm md:text-base font-medium text-gray-500 mb-2 tracking-wide">
            &ldquo;Your Intelligence. Your World.&rdquo;
          </p>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium mb-8">
            <span>Host Owners:</span>
            <span className="font-semibold text-gray-900">Arnav Sharma &amp; Akshit Kanswal</span>
          </div>

          {/* Clean ChatGPT-style Prompt Suggestion Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full max-w-3xl text-left">
            {promptSuggestions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onSendMessage(item.label)}
                  className="p-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200/90 hover:border-gray-300 transition-all cursor-pointer group shadow-xs hover:shadow-sm active:scale-98"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-gray-900">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Message Stream */
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={message.id}
                className={`flex gap-3 md:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="shrink-0 mt-0.5">
                    <ZeroxOrb size="sm" state={message.isStreaming ? 'thinking' : 'idle'} />
                  </div>
                )}

                <div
                  className={`max-w-[88%] md:max-w-[82%] rounded-2xl transition-all ${
                    isUser
                      ? 'bg-[#f4f4f4] text-gray-900 px-4 py-3 rounded-2xl'
                      : 'bg-white text-gray-900 p-2'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between gap-3 mb-1 text-xs text-gray-400">
                    <span className="font-semibold text-gray-800 text-xs">
                      {isUser ? currentUser?.name || 'You' : 'Zerox GPT Nano'}
                    </span>

                    <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                      {isUser ? (
                        <button
                          onClick={() => startEdit(message)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 cursor-pointer"
                          title="Edit message"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSpeak(message.id, message.content)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 cursor-pointer"
                            title={speakingMsgId === message.id ? 'Stop speaking' : 'Read aloud'}
                          >
                            {speakingMsgId === message.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-cyan-700 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy(message.id, message.content)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 cursor-pointer"
                            title="Copy response"
                          >
                            {copiedMsgId === message.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  {editingMsgId === message.id ? (
                    <form onSubmit={(e) => submitEdit(message.id, e)} className="space-y-2 mt-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-cyan-600 shadow-xs"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingMsgId(null)}
                          className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 rounded-lg bg-gray-900 text-white font-semibold text-xs hover:bg-gray-800 cursor-pointer"
                        >
                          Save &amp; Resend
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="relative">
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-normal text-gray-900">
                          {message.content}
                        </p>
                      ) : (
                        <MarkdownRenderer content={message.content} />
                      )}

                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-cyan-600 animate-pulse align-middle" />
                      )}
                    </div>
                  )}

                  {/* Embedded Zerox Actions Cards */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200 space-y-2">
                      {message.actions.map((action) => (
                        <ActionCard
                          key={action.id}
                          action={action}
                          onConfirm={onActionExecute}
                          onCreateTimer={onCreateTimer}
                          onCreateReminder={onCreateReminder}
                          onCreateNote={onCreateNote}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {currentUser?.avatar || 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Regenerate Response Button (ChatGPT style) */}
          {messages.length > 0 &&
            !isStreaming &&
            messages[messages.length - 1].role === 'assistant' && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-300 text-xs font-medium text-gray-700 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
                  <span>Regenerate response</span>
                </button>
              </div>
            )}

          <div ref={bottomRef} className="h-4" />
        </div>
      )}
    </div>
  );
};
