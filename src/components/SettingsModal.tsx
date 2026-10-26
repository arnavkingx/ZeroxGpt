import React, { useState } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Save,
  Volume2,
  Globe,
  Sliders,
  HelpCircle,
  X,
  Sparkles,
  RefreshCw,
  Shield,
  UserCheck,
} from 'lucide-react';
import { User, LanguagePreference, PersonalityType } from '../types';
import { testGeminiApiKey } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateUser: (updates: Partial<User>) => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'api' | 'voice' | 'language' | 'privacy' | 'guide'>('api');

  const [apiKeyInput, setApiKeyInput] = useState<string>(currentUser?.customApiKey || '');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [selectedModel, setSelectedModel] = useState<string>(
    currentUser?.selectedModel || 'Zerox GPT Nano'
  );
  const [selectedLang, setSelectedLang] = useState<LanguagePreference>(
    currentUser?.preferredLanguage || 'en'
  );
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityType>(
    currentUser?.personality || 'default'
  );
  const [autoSpeak, setAutoSpeak] = useState<boolean>(Boolean(currentUser?.autoSpeak));

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testGeminiApiKey(apiKeyInput.trim() || undefined);
    setIsTesting(false);
    if (result.success) {
      setTestResult({
        success: true,
        message: result.message || 'Zerox Engine verified! Ready for queries.',
      });
    } else {
      setTestResult({
        success: false,
        message: result.error || 'Connection failed. Please check your Zerox key.',
      });
    }
  };

  const handleSaveApiKey = () => {
    onUpdateUser({
      customApiKey: apiKeyInput.trim(),
      selectedModel,
    });
    setSaveStatus('Zerox Engine settings saved successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleRemoveKey = () => {
    setApiKeyInput('');
    onUpdateUser({ customApiKey: '' });
    setTestResult(null);
    setSaveStatus('Custom key removed. Using default host engine configuration.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleSaveGeneral = () => {
    onUpdateUser({
      preferredLanguage: selectedLang,
      personality: selectedPersonality,
      autoSpeak,
      selectedModel,
    });
    setSaveStatus('Preferences updated successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200">
              <Sliders className="w-5 h-5 text-cyan-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Zerox Settings</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-semibold">
                  Nano
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Host Owners: <span className="font-semibold text-gray-700">Arnav Sharma &amp; Akshit Kanswal</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-gray-200 bg-gray-50/60 overflow-x-auto">
          {[
            { id: 'api', label: 'Zerox Engine', icon: Key },
            { id: 'voice', label: 'Voice & Speech', icon: Volume2 },
            { id: 'language', label: 'Language & Persona', icon: Globe },
            { id: 'privacy', label: 'History & Privacy', icon: Trash2 },
            { id: 'guide', label: 'Host & Ownership', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                  active
                    ? 'text-cyan-800 border-cyan-600 bg-white'
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-800 text-sm bg-white">
          {saveStatus && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{saveStatus}</span>
            </div>
          )}

          {/* TAB 1: Zerox Engine Key & Model */}
          {activeTab === 'api' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Zerox Neural Engine</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Zerox GPT Nano is hosted and managed by Arnav Sharma &amp; Akshit Kanswal.
                  Default cloud engine keys are handled automatically, or you can supply your dedicated host key.
                </p>
              </div>

              {/* Active Model Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Active Engine Model</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'Zerox GPT Nano',
                      name: 'Zerox GPT Nano',
                      desc: 'Ultra-fast, responsive, lightweight intelligence engine.',
                      badge: 'Default & Fast',
                    },
                    {
                      id: 'Zerox GPT Nano Turbo',
                      name: 'Zerox GPT Nano Turbo',
                      desc: 'Extended throughput engine for complex coding & reasoning.',
                      badge: 'Turbo Mode',
                    },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedModel === m.id
                          ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-gray-900">{m.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-mono font-medium">
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zerox Host Key Input */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>Zerox Engine Host Key (Optional)</span>
                  <span className="text-[11px] text-cyan-700">Encrypted in session</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="zx_live_host_key... (leave blank to use host default)"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Verifying...' : 'Test Engine Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white shadow-xs active:scale-98 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Engine Settings</span>
                </button>

                {apiKeyInput && (
                  <button
                    type="button"
                    onClick={handleRemoveKey}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to Default</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Voice & Audio */}
          {activeTab === 'voice' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Voice & Speech</h3>
                <p className="text-xs text-gray-500">
                  Configure speech synthesis, spoken responses, and full-screen voice mode.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer hover:border-gray-300">
                  <div>
                    <div className="font-semibold text-xs text-gray-900">Auto-speak AI responses</div>
                    <div className="text-[11px] text-gray-500">
                      Zerox GPT Nano will read responses aloud automatically.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSpeak}
                    onChange={(e) => setAutoSpeak(e.target.checked)}
                    className="w-4 h-4 accent-cyan-600 cursor-pointer"
                  />
                </label>

                <div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/50 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-900 font-semibold text-xs">
                    <Sparkles className="w-4 h-4 text-cyan-700" />
                    <span>Zerox Full-Screen Voice Mode</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Tap the Voice Mode button in the header for hands-free real-time speech conversation
                    with the animated plasma orb.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveGeneral}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Save Audio Preferences
              </button>
            </div>
          )}

          {/* TAB 3: Language & Personality */}
          {activeTab === 'language' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Language & Personality</h3>
                <p className="text-xs text-gray-500">
                  Zerox GPT Nano natively adapts between English, Hindi, and Hinglish.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Preferred Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'en', label: 'English', desc: 'Standard Global' },
                    { id: 'hinglish', label: 'Hinglish', desc: 'Hindi in Roman' },
                    { id: 'hi', label: 'Hindi (हिंदी)', desc: 'Devanagari' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setSelectedLang(lang.id as LanguagePreference)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedLang === lang.id
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-semibold shadow-xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs">{lang.label}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{lang.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-gray-700">Assistant Persona</label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'default',
                      name: 'Zerox Default',
                      desc: 'Sharp, versatile, proactive personal companion.',
                    },
                    {
                      id: 'architect',
                      name: 'Code Architect',
                      desc: 'Senior engineer focused on clean architecture and TypeScript.',
                    },
                    {
                      id: 'tutor',
                      name: 'Academic Tutor',
                      desc: 'Step-by-step conceptual mastery for STEM & school topics.',
                    },
                    {
                      id: 'hinglish_buddy',
                      name: 'Hinglish Buddy',
                      desc: 'Friendly, relatable conversation in natural Hinglish.',
                    },
                    {
                      id: 'writer',
                      name: 'Creative Writer',
                      desc: 'Expressive storytelling, scripts, and impactful prose.',
                    },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPersonality(p.id as PersonalityType)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedPersonality === p.id
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-gray-900">{p.name}</div>
                        <div className="text-[11px] text-gray-500">{p.desc}</div>
                      </div>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border ${
                          selectedPersonality === p.id
                            ? 'border-cyan-600 bg-cyan-600'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveGeneral}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Save Persona & Language
              </button>
            </div>
          )}

          {/* TAB 4: Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Data Privacy & History</h3>
                <p className="text-xs text-gray-500">
                  Each user account stores its chat history in an isolated partition. Conversations
                  are kept private and never shared.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Account:</span>
                  <span className="font-semibold text-gray-900">{currentUser?.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-mono text-gray-700">{currentUser?.email}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2.5">
                <h4 className="font-semibold text-xs text-rose-800">Clear Conversations</h4>
                <p className="text-xs text-gray-600">
                  Permanently delete all conversation history for your account.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete all conversations?')) {
                      onClearHistory();
                      setSaveStatus('Conversation history cleared.');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All Conversations</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Host & Ownership */}
          {activeTab === 'guide' && (
            <div className="space-y-5 text-xs text-gray-700 leading-relaxed">
              <div className="p-4 rounded-2xl border border-cyan-200 bg-cyan-50/60 space-y-3">
                <div className="flex items-center gap-2 text-cyan-900 font-bold text-sm">
                  <UserCheck className="w-5 h-5 text-cyan-700" />
                  <span>Host Ownership &amp; Creators</span>
                </div>
                <p className="text-gray-700 text-xs leading-relaxed">
                  Zerox GPT Nano is created, engineered, and hosted by:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white border border-cyan-200/80 shadow-xs">
                    <div className="font-bold text-gray-900 text-sm">Arnav Sharma</div>
                    <div className="text-[11px] text-cyan-700 font-medium">Host Owner &amp; Lead Architect</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-cyan-200/80 shadow-xs">
                    <div className="font-bold text-gray-900 text-sm">Akshit Kanswal</div>
                    <div className="text-[11px] text-cyan-700 font-medium">Host Owner &amp; Co-Developer</div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-1">
                <span className="font-semibold text-gray-900">1. Instant Zerox Neural Streaming</span>
                <p>
                  Zerox GPT Nano provides millisecond response times for coding, academics, creative writing,
                  and multilingual dialogues.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-1">
                <span className="font-semibold text-gray-900">2. Real-World Actions</span>
                <p>
                  Zerox can open YouTube, launch Google searches, draft WhatsApp messages, trigger Google Maps,
                  and manage in-app timers and reminders.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
