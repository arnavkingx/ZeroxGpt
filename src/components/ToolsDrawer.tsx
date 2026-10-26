import React, { useState, useEffect } from 'react';
import {
  Timer,
  Bell,
  FileText,
  Smartphone,
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Copy,
  ExternalLink,
  PhoneCall,
  MessageCircle,
  Sliders,
  Battery,
  Wifi,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { ActiveTimer, NoteItem, ReminderItem, User } from '../types';
import { StorageService } from '../services/storage';

interface ToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  activeTimers: ActiveTimer[];
  setActiveTimers: React.Dispatch<React.SetStateAction<ActiveTimer[]>>;
}

export const ToolsDrawer: React.FC<ToolsDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeTimers,
  setActiveTimers,
}) => {
  const [activeTab, setActiveTab] = useState<'timers' | 'reminders' | 'notes' | 'android'>('timers');

  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('18:00');

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isScrollingSim, setIsScrollingSim] = useState(false);
  const [dialNumber, setDialNumber] = useState('+91 98765 43210');
  const [waText, setWaText] = useState('Hey, checking in with Zerox GPT Nano!');

  useEffect(() => {
    if (currentUser?.id) {
      setReminders(StorageService.getReminders(currentUser.id));
      setNotes(StorageService.getNotes(currentUser.id));
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  }, []);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setActiveTimers((prev) =>
        prev.map((t) => {
          if (!t.isRunning || t.remainingSeconds <= 0) return t;
          const next = t.remainingSeconds - 1;
          if (next === 0) {
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6);
              gain.gain.setValueAtTime(0.3, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.6);
            } catch {}
          }
          return { ...t, remainingSeconds: next };
        })
      );
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [setActiveTimers]);

  if (!isOpen) return null;

  const handleAddTimer = (label: string, minutes: number) => {
    const newTimer: ActiveTimer = {
      id: `timer_${Date.now()}`,
      label: label || `${minutes} Min Timer`,
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      isRunning: true,
      startedAt: Date.now(),
    };
    setActiveTimers((prev) => [newTimer, ...prev]);
  };

  const toggleTimer = (id: string) => {
    setActiveTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t))
    );
  };

  const resetTimer = (id: string) => {
    setActiveTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false } : t))
    );
  };

  const deleteTimer = (id: string) => {
    setActiveTimers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim() || !currentUser?.id) return;
    const newRem: ReminderItem = {
      id: `rem_${Date.now()}`,
      text: newReminderText.trim(),
      dueTime: newReminderTime,
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      createdAt: Date.now(),
    };
    const updated = [newRem, ...reminders];
    setReminders(updated);
    StorageService.saveReminders(currentUser.id, updated);
    setNewReminderText('');
  };

  const toggleReminder = (id: string) => {
    if (!currentUser?.id) return;
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    setReminders(updated);
    StorageService.saveReminders(currentUser.id, updated);
  };

  const deleteReminder = (id: string) => {
    if (!currentUser?.id) return;
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    StorageService.saveReminders(currentUser.id, updated);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;
    if (!currentUser?.id) return;

    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      title: newNoteTitle.trim() || 'Untitled Note',
      content: newNoteContent.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    StorageService.saveNotes(currentUser.id, updated);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleDeleteNote = (id: string) => {
    if (!currentUser?.id) return;
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    StorageService.saveNotes(currentUser.id, updated);
  };

  const handleCopyNote = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedNoteId(id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const triggerAutoScrollDemo = () => {
    setIsScrollingSim(true);
    let count = 0;
    const scrollStep = () => {
      window.scrollBy({ top: 120, behavior: 'smooth' });
      count++;
      if (count < 5) {
        setTimeout(scrollStep, 500);
      } else {
        setIsScrollingSim(false);
      }
    };
    scrollStep();
  };

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col animate-slide-left select-none text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200">
            <Sliders className="w-5 h-5 text-cyan-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Zerox Tools &amp; Actions</h2>
            <p className="text-xs text-gray-500">Timers, Reminders, Notes, &amp; Android Bridge</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50 text-xs">
        {[
          { id: 'timers', label: 'Timers', icon: Timer },
          { id: 'reminders', label: 'Reminders', icon: Bell },
          { id: 'notes', label: 'Notes', icon: FileText },
          { id: 'android', label: 'Android Bridge', icon: Smartphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 font-medium transition-all cursor-pointer border-b-2 ${
                active
                  ? 'text-cyan-800 border-cyan-600 bg-white font-semibold'
                  : 'text-gray-500 border-transparent hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-gray-800 text-xs bg-white">
        {/* TIMERS */}
        {activeTab === 'timers' && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Quick Presets
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '1m', min: 1 },
                  { label: '5m', min: 5 },
                  { label: '15m', min: 15 },
                  { label: '25m Focus', min: 25 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleAddTimer(item.label, item.min)}
                    className="py-2 px-1 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 font-semibold text-center transition-all cursor-pointer active:scale-95"
                  >
                    +{item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active Timers ({activeTimers.length})
              </div>

              {activeTimers.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-400">
                  <Timer className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-600" />
                  <p>No active timers running.</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Ask &ldquo;Set a 5 minute timer&rdquo; or tap presets above.
                  </p>
                </div>
              ) : (
                activeTimers.map((t) => {
                  const progress = ((t.totalSeconds - t.remainingSeconds) / t.totalSeconds) * 100;
                  const isDone = t.remainingSeconds === 0;

                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isDone
                          ? 'border-emerald-300 bg-emerald-50/60'
                          : 'border-gray-200 bg-white shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{t.label}</span>
                        <span
                          className={`font-mono text-base font-bold ${
                            isDone ? 'text-emerald-700 animate-pulse' : 'text-cyan-700'
                          }`}
                        >
                          {isDone ? "Time's Up!" : formatTimeRemaining(t.remainingSeconds)}
                        </span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden mb-3">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isDone
                              ? 'bg-emerald-500'
                              : 'bg-cyan-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        {!isDone && (
                          <button
                            onClick={() => toggleTimer(t.id)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                          >
                            {t.isRunning ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => resetTimer(t.id)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-pointer"
                          title="Reset"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTimer(t.id)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-rose-100 text-gray-500 hover:text-rose-600 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* REMINDERS */}
        {activeTab === 'reminders' && (
          <div className="space-y-4">
            <form onSubmit={handleAddReminder} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2">
              <span className="font-semibold text-gray-900">Add Reminder</span>
              <input
                type="text"
                value={newReminderText}
                onChange={(e) => setNewReminderText(e.target.value)}
                placeholder="Submit report, call family..."
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-cyan-600"
              />
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Scheduled Reminders
              </div>
              {reminders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-yellow-600" />
                  <p>No reminders scheduled.</p>
                </div>
              ) : (
                reminders.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      r.completed
                        ? 'border-gray-200 bg-gray-50 opacity-60'
                        : 'border-yellow-200 bg-yellow-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => toggleReminder(r.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                          r.completed
                            ? 'bg-yellow-500 border-yellow-500 text-white'
                            : 'border-gray-300 hover:border-yellow-500 bg-white'
                        }`}
                      >
                        {r.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <div>
                        <div
                          className={`font-medium ${
                            r.completed ? 'line-through text-gray-400' : 'text-gray-800'
                          }`}
                        >
                          {r.text}
                        </div>
                        <div className="text-[10px] text-yellow-800 font-mono">
                          {r.dueTime} &bull; {r.dueDate}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteReminder(r.id)}
                      className="p-1 rounded text-gray-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <form onSubmit={handleAddNote} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2">
              <span className="font-semibold text-gray-900">Create Quick Note</span>
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note Title..."
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-cyan-600"
              />
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={3}
                placeholder="Note content, ideas, code snippet..."
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-600 resize-none"
              />
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Save Note
              </button>
            </form>

            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Saved Notes ({notes.length})
              </div>
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{n.title}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyNote(n.id, n.content)}
                        className="p-1 rounded text-gray-400 hover:text-gray-700 cursor-pointer"
                        title="Copy note"
                      >
                        {copiedNoteId === n.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="p-1 rounded text-gray-400 hover:text-rose-600 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[11px] font-mono bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {n.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANDROID BRIDGE */}
        {activeTab === 'android' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/50 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-cyan-700" />
                <span>Authorized Companion Bridge</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Interacts with system intents (Phone dialer, WhatsApp, Google Maps) and simulated
                accessibility scrolling. Sensitive actions require explicit user confirmation.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 grid grid-cols-2 gap-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-emerald-600" />
                <span>Battery: {batteryLevel !== null ? `${batteryLevel}%` : '98%'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-cyan-700" />
                <span>Status: Connected</span>
              </div>
            </div>

            {/* Phone Call Intent */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <PhoneCall className="w-4 h-4 text-green-600" />
                <span>Phone Call Intent</span>
              </div>
              <input
                type="text"
                value={dialNumber}
                onChange={(e) => setDialNumber(e.target.value)}
                placeholder="+91..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-cyan-600"
              />
              <button
                onClick={() => {
                  if (confirm(`Authorize launch of phone dialer for ${dialNumber}?`)) {
                    window.location.href = `tel:${dialNumber.replace(/[^0-9+]/g, '')}`;
                  }
                }}
                className="w-full py-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Launch Dialer (Confirmation Required)
              </button>
            </div>

            {/* WhatsApp Intent */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Message Intent</span>
              </div>
              <input
                type="text"
                value={waText}
                onChange={(e) => setWaText(e.target.value)}
                placeholder="Message text..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-cyan-600"
              />
              <button
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank');
                }}
                className="w-full py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open WhatsApp Web/App
              </button>
            </div>

            {/* Accessibility Auto-scroll */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Accessibility Auto-Scroll</span>
                <span className="text-[10px] text-cyan-800 font-mono font-medium">Simulation</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Simulates hands-off scrolling for Instagram Reels, YouTube Shorts, and articles.
              </p>
              <button
                onClick={triggerAutoScrollDemo}
                disabled={isScrollingSim}
                className="w-full py-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ChevronDown className={`w-4 h-4 ${isScrollingSim ? 'animate-bounce' : ''}`} />
                <span>{isScrollingSim ? 'Auto-Scrolling Active...' : 'Test Auto-Scroll (5 Steps)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
