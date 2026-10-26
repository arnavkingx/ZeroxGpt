import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Square,
  Sparkles,
  Radio,
} from 'lucide-react';
import { ZeroxOrb } from './ZeroxOrb';
import { User } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSendVoiceMessage: (text: string) => Promise<string>;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSendVoiceMessage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [audioLevel, setAudioLevel] = useState(0.2);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
        if (available.length > 0 && !selectedVoice) {
          const preferred =
            available.find((v) => v.lang.includes('en-IN')) ||
            available.find((v) => v.name.includes('Natural') || v.name.includes('Google')) ||
            available[0];
          if (preferred) setSelectedVoice(preferred.name);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, [selectedVoice]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      if (isListening || isSpeaking) {
        setAudioLevel(0.3 + Math.random() * 0.6);
      } else if (isThinking) {
        setAudioLevel(0.2);
      } else {
        setAudioLevel(0.05);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [isOpen, isListening, isSpeaking, isThinking]);

  useEffect(() => {
    if (!isOpen) {
      stopAll();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setTranscript('Speech recognition is not supported in this browser. Please use Chrome/Edge or modern Android browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang =
      currentUser?.preferredLanguage === 'hi'
        ? 'hi-IN'
        : currentUser?.preferredLanguage === 'hinglish'
        ? 'hi-IN'
        : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let currentInterim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      const activeText = (finalTranscript || currentInterim).trim();
      if (activeText) {
        setTranscript(activeText);

        if (
          wakeWordEnabled &&
          (activeText.toLowerCase().includes('zerox') ||
            activeText.toLowerCase().includes('hey zerox'))
        ) {
          const cleaned = activeText.replace(/hey\s*zerox|zerox/gi, '').trim();
          if (cleaned.length > 2 && !isThinking && !isSpeaking) {
            handleProcessVoiceInput(cleaned);
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isOpen && !isMuted && !isSpeaking) {
        try {
          recognition.start();
        } catch {}
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [isOpen, isMuted, currentUser?.preferredLanguage, wakeWordEnabled]);

  const stopAll = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false);
  };

  const speakText = (text: string) => {
    if (!synthRef.current || isMuted) return;

    synthRef.current.cancel();

    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*#_`>]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .trim();

    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);

    if (selectedVoice) {
      const v = voices.find((item) => item.name === selectedVoice);
      if (v) utterance.voice = v;
    }

    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (recognitionRef.current && !isMuted) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  const handleProcessVoiceInput = async (userInput: string) => {
    if (!userInput.trim() || isThinking) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setIsThinking(true);
    setAiResponse('Thinking...');

    try {
      const reply = await onSendVoiceMessage(userInput);
      setIsThinking(false);
      setAiResponse(reply);
      speakText(reply);
    } catch (err: any) {
      setIsThinking(false);
      const errMsg = err?.message || 'Sorry, I encountered an issue answering that.';
      setAiResponse(errMsg);
      speakText(errMsg);
    }
  };

  const handleInterrupt = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    if (recognitionRef.current && !isMuted) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopAll();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    }
  };

  if (!isOpen) return null;

  const currentOrbState = isThinking
    ? 'thinking'
    : isSpeaking
    ? 'speaking'
    : isListening
    ? 'listening'
    : 'idle';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-white/95 backdrop-blur-2xl p-6 text-gray-900 animate-fade-in select-none">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200">
            <Radio className="w-5 h-5 text-cyan-700 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-gray-900">
                Zerox Voice
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-semibold">
                Nano
              </span>
            </div>
            <p className="text-xs text-gray-500">Natural hands-free voice conversationalist</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setWakeWordEnabled(!wakeWordEnabled)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all cursor-pointer ${
              wakeWordEnabled
                ? 'bg-cyan-50 border-cyan-300 text-cyan-800 font-medium'
                : 'bg-gray-100 border-gray-200 text-gray-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>Wake-word: &ldquo;Hey Zerox&rdquo;</span>
          </button>

          <button
            onClick={() => {
              stopAll();
              onClose();
            }}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center AI Orb */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 max-w-2xl w-full text-center">
        {/* Status pill */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide bg-gray-100 border border-gray-200 text-gray-700 shadow-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isSpeaking
                  ? 'bg-emerald-500 animate-ping'
                  : isThinking
                  ? 'bg-amber-500 animate-spin'
                  : isListening
                  ? 'bg-cyan-600 animate-pulse'
                  : 'bg-gray-400'
              }`}
            />
            {isThinking
              ? 'Zerox GPT Nano is thinking...'
              : isSpeaking
              ? 'Zerox GPT Nano is speaking...'
              : isListening
              ? 'Listening to you...'
              : 'Tap microphone to speak'}
          </span>
        </div>

        <div className="relative my-4 flex items-center justify-center">
          <ZeroxOrb
            size="hero"
            state={currentOrbState}
            audioLevel={audioLevel}
            onClick={() => {
              if (isSpeaking) handleInterrupt();
            }}
          />
        </div>

        {/* Audio Waveform */}
        <div className="flex items-center gap-1.5 h-10 my-4">
          {Array.from({ length: 24 }).map((_, idx) => {
            const h =
              isListening || isSpeaking
                ? Math.max(6, Math.sin(idx * 0.5 + Date.now() * 0.005) * 32 * audioLevel + 12)
                : 4;
            return (
              <div
                key={idx}
                className="w-1.5 rounded-full bg-gradient-to-t from-cyan-600 to-sky-400 transition-all duration-100"
                style={{
                  height: `${h}px`,
                  opacity: isListening || isSpeaking ? 0.9 : 0.25,
                }}
              />
            );
          })}
        </div>

        {/* Subtitles box */}
        <div className="w-full max-w-lg mt-4 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 min-h-[72px] flex items-center justify-center text-center shadow-xs">
          {isThinking ? (
            <p className="text-sm text-cyan-700 animate-pulse font-medium">
              Zerox GPT Nano is generating response...
            </p>
          ) : isSpeaking ? (
            <p className="text-sm text-gray-800 line-clamp-3 leading-relaxed font-medium">
              &ldquo;{aiResponse}&rdquo;
            </p>
          ) : transcript ? (
            <p className="text-sm text-gray-800 font-medium">
              &ldquo;{transcript}&rdquo;
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Say &ldquo;Hey Zerox, what is new today?&rdquo; or tap mic to speak.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-xl flex flex-col items-center gap-4">
        {transcript && !isThinking && !isSpeaking && (
          <button
            onClick={() => handleProcessVoiceInput(transcript)}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-sm transition-all cursor-pointer"
          >
            Send: &ldquo;{transcript.substring(0, 32)}...&rdquo;
          </button>
        )}

        <div className="flex items-center justify-center gap-4 w-full bg-gray-50 border border-gray-200 p-3 rounded-2xl shadow-sm">
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className={`p-3.5 rounded-full transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-100 border border-rose-300 text-rose-700'
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {isSpeaking && (
            <button
              onClick={handleInterrupt}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold hover:bg-amber-200 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-amber-700 text-amber-700" />
              <span>Interrupt Zerox</span>
            </button>
          )}

          <button
            onClick={() => {
              if (isListening) {
                if (transcript) handleProcessVoiceInput(transcript);
                else stopAll();
              } else {
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch {}
                }
              }
            }}
            className={`p-4 rounded-full transition-all shadow-md active:scale-95 cursor-pointer ${
              isListening
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-900 hover:bg-gray-800 text-white'
            }`}
          >
            {isListening ? <Mic className="w-6 h-6 animate-pulse" /> : <MicOff className="w-6 h-6" />}
          </button>

          {voices.length > 0 && (
            <div className="relative hidden sm:block">
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-800 max-w-[140px] truncate focus:outline-none focus:border-cyan-600 shadow-xs"
              >
                {voices.slice(0, 15).map((v) => (
                  <option key={v.name} value={v.name} className="bg-white text-gray-800">
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
