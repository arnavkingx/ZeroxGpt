import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Mic,
  Globe,
} from 'lucide-react';
import { LanguagePreference, PersonalityType } from '../types';

interface MessageComposerProps {
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  onStopGeneration: () => void;
  preferredLanguage?: LanguagePreference;
  personality?: PersonalityType;
  onQuickPrompt?: (prompt: string) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  isStreaming,
  onStopGeneration,
  preferredLanguage = 'en',
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollH, 180)}px`;
    }
  }, [inputText]);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang =
      preferredLanguage === 'hi' ? 'hi-IN' : preferredLanguage === 'hinglish' ? 'hi-IN' : 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) {
        setInputText((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputText.trim() || isStreaming) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-1 select-none bg-white">
      {/* Floating ChatGPT-style input pill */}
      <div className="relative rounded-3xl bg-[#f4f4f4] border border-gray-200/80 focus-within:border-gray-400 focus-within:bg-white shadow-xs focus-within:shadow-md transition-all">
        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            preferredLanguage === 'hinglish'
              ? 'Zerox GPT Nano se pucho (e.g. "Python API kaise banayein?")...'
              : preferredLanguage === 'hi'
              ? 'Zerox GPT Nano से कुछ भी पूछें...'
              : 'Message Zerox GPT Nano...'
          }
          rows={1}
          className="w-full bg-transparent text-gray-900 placeholder:text-gray-500 text-sm md:text-base px-4 pt-3 pb-2 resize-none focus:outline-none min-h-[46px] max-h-[160px] leading-relaxed"
        />

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between px-3 pb-2 pt-0.5">
          {/* Left tools */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'hover:text-gray-900 hover:bg-gray-200/80 text-gray-500'
              }`}
              title={isRecording ? 'Listening...' : 'Voice Input'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-gray-600 px-2 py-0.5 rounded-full bg-gray-200/60">
              <Globe className="w-3 h-3 text-cyan-700" />
              {preferredLanguage.toUpperCase()}
            </span>
          </div>

          {/* Right action button */}
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 transition-all cursor-pointer shadow-xs"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all cursor-pointer ${
                  inputText.trim()
                    ? 'bg-black text-white hover:bg-gray-800 shadow-xs'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center pt-2 text-[11px] text-gray-400">
        Zerox GPT Nano can make mistakes. Verify important information.
      </div>
    </div>
  );
};
