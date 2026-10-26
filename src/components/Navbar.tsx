import React from 'react';
import {
  Menu,
  Mic,
  Sliders,
  Settings,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { User } from '../types';
import { ZeroxOrb } from './ZeroxOrb';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenVoiceModal: () => void;
  onOpenToolsDrawer: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  currentUser: User | null;
  selectedModel: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenVoiceModal,
  onOpenToolsDrawer,
  onOpenSettings,
  onOpenAuth,
  currentUser,
  selectedModel,
}) => {
  return (
    <header className="h-14 border-b border-gray-200 bg-white/95 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none shrink-0 shadow-sm">
      {/* Left: Mobile Menu & Brand */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:hidden cursor-pointer transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <ZeroxOrb size="sm" state="idle" />
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-base text-gray-900">
              Zerox
            </span>
            <span className="font-semibold text-xs px-1.5 py-0.5 rounded bg-gray-100 text-cyan-700 font-mono">
              Nano
            </span>
          </div>
        </div>

        {/* Model dropdown badge (ChatGPT Style) */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200/80 text-gray-800 text-xs font-semibold cursor-pointer transition-colors border border-gray-200/70"
          title="Switch model or settings"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-600" />
          <span>Zerox GPT Nano</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Voice Assistant Launcher */}
        <button
          onClick={onOpenVoiceModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Mic className="w-3.5 h-3.5 text-cyan-700 animate-pulse" />
          <span className="hidden xs:inline">Voice Mode</span>
        </button>

        {/* Actions & Tools Hub */}
        <button
          onClick={onOpenToolsDrawer}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          title="Tools & Android Bridge"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User profile avatar or Sign In */}
        {currentUser ? (
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-500 text-white font-bold text-xs flex items-center justify-center hover:opacity-95 transition-opacity cursor-pointer shadow-sm ml-1"
            title={currentUser.name}
          >
            {currentUser.avatar || 'Z'}
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-full bg-gray-900 text-white font-semibold text-xs hover:bg-gray-800 transition-colors cursor-pointer ml-1"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
