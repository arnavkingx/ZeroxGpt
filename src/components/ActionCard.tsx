import React, { useState } from 'react';
import {
  Youtube,
  Search,
  MessageCircle,
  MapPin,
  Film,
  Timer,
  Bell,
  FileText,
  PhoneCall,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Play,
} from 'lucide-react';
import { ZeroxAction } from '../types';

interface ActionCardProps {
  action: ZeroxAction;
  onConfirm?: (action: ZeroxAction) => void;
  onCancel?: (action: ZeroxAction) => void;
  onCreateTimer?: (label: string, minutes: number) => void;
  onCreateReminder?: (text: string, time: string) => void;
  onCreateNote?: (title: string, content: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  onConfirm,
  onCancel,
  onCreateTimer,
  onCreateReminder,
  onCreateNote,
}) => {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'executed' | 'cancelled'>(action.status);

  const handleExecute = () => {
    setStatus('executed');
    action.status = 'executed';

    const data = action.data || {};
    switch (action.type) {
      case 'youtube_search': {
        const query = encodeURIComponent(data.query || data.song || data.video || 'music');
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
        break;
      }
      case 'google_search': {
        const query = encodeURIComponent(data.query || 'Google');
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
        break;
      }
      case 'whatsapp_message': {
        const text = encodeURIComponent(data.message || data.text || '');
        const phone = data.phone ? data.phone.replace(/[^0-9]/g, '') : '';
        const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
        window.open(url, '_blank');
        break;
      }
      case 'maps_navigate': {
        const destination = encodeURIComponent(data.destination || data.location || data.query || '');
        window.open(`https://www.google.com/maps/search/?api=1&query=${destination}`, '_blank');
        break;
      }
      case 'open_reels': {
        window.open('https://www.instagram.com/reels/', '_blank');
        break;
      }
      case 'open_shorts': {
        window.open('https://www.youtube.com/shorts', '_blank');
        break;
      }
      case 'create_timer': {
        const minutes = Number(data.minutes || data.duration || 5);
        const label = data.label || 'Zerox Timer';
        if (onCreateTimer) onCreateTimer(label, minutes);
        break;
      }
      case 'create_reminder': {
        const text = data.text || data.reminder || 'Reminder';
        const time = data.time || '18:00';
        if (onCreateReminder) onCreateReminder(text, time);
        break;
      }
      case 'create_note': {
        const title = data.title || 'Quick Note';
        const content = data.content || '';
        if (onCreateNote) onCreateNote(title, content);
        break;
      }
      case 'android_call': {
        const number = (data.number || data.phone || '').replace(/[^0-9+]/g, '');
        if (number) {
          window.location.href = `tel:${number}`;
        }
        break;
      }
    }

    if (onConfirm) onConfirm(action);
  };

  const handleCancel = () => {
    setStatus('cancelled');
    action.status = 'cancelled';
    if (onCancel) onCancel(action);
  };

  const getActionMeta = () => {
    switch (action.type) {
      case 'youtube_search':
        return {
          icon: Youtube,
          color: 'text-rose-600',
          bg: 'bg-rose-50/70 border-rose-200',
          btnText: 'Open in YouTube',
          isExternal: true,
          badge: 'YouTube',
        };
      case 'google_search':
        return {
          icon: Search,
          color: 'text-blue-600',
          bg: 'bg-blue-50/70 border-blue-200',
          btnText: 'Search on Google',
          isExternal: true,
          badge: 'Search',
        };
      case 'whatsapp_message':
        return {
          icon: MessageCircle,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50/70 border-emerald-200',
          btnText: 'Open WhatsApp & Send',
          isExternal: true,
          badge: 'WhatsApp',
          needsSensitiveConfirm: true,
        };
      case 'maps_navigate':
        return {
          icon: MapPin,
          color: 'text-amber-600',
          bg: 'bg-amber-50/70 border-amber-200',
          btnText: 'Open Google Maps',
          isExternal: true,
          badge: 'Maps',
        };
      case 'open_reels':
      case 'open_shorts':
        return {
          icon: Film,
          color: 'text-purple-600',
          bg: 'bg-purple-50/70 border-purple-200',
          btnText: action.type === 'open_reels' ? 'Open Instagram Reels' : 'Open YouTube Shorts',
          isExternal: true,
          badge: 'Video',
        };
      case 'create_timer':
        return {
          icon: Timer,
          color: 'text-cyan-700',
          bg: 'bg-cyan-50/70 border-cyan-200',
          btnText: 'Start Timer in App',
          isExternal: false,
          badge: 'Timer',
        };
      case 'create_reminder':
        return {
          icon: Bell,
          color: 'text-yellow-700',
          bg: 'bg-yellow-50/70 border-yellow-200',
          btnText: 'Save Reminder',
          isExternal: false,
          badge: 'Reminder',
        };
      case 'create_note':
        return {
          icon: FileText,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50/70 border-indigo-200',
          btnText: 'Save to Notes',
          isExternal: false,
          badge: 'Note',
        };
      case 'android_call':
        return {
          icon: PhoneCall,
          color: 'text-green-700',
          bg: 'bg-green-50/70 border-green-200',
          btnText: 'Launch Phone Dialer',
          isExternal: true,
          badge: 'Android Companion',
          needsSensitiveConfirm: true,
        };
      default:
        return {
          icon: Play,
          color: 'text-cyan-700',
          bg: 'bg-cyan-50/70 border-cyan-200',
          btnText: 'Execute',
          isExternal: false,
          badge: 'Action',
        };
    }
  };

  const meta = getActionMeta();
  const Icon = meta.icon;

  return (
    <div
      className={`my-2.5 p-3 rounded-xl border transition-all ${meta.bg} shadow-xs`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-white shadow-xs ${meta.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Zerox Action &bull; {meta.badge}
            </div>
            <div className="text-xs font-semibold text-gray-900">{action.title}</div>
          </div>
        </div>

        {status === 'executed' && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Executed
          </span>
        )}
        {status === 'cancelled' && (
          <span className="flex items-center gap-1 text-[11px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-medium">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        )}
      </div>

      {/* Action details */}
      <div className="bg-white rounded-lg p-2 text-xs text-gray-700 font-mono space-y-1 mb-2.5 border border-gray-200/80">
        {action.data.query && (
          <div>
            <span className="text-gray-400">Query: </span>
            <span className="text-cyan-800 font-semibold">{action.data.query}</span>
          </div>
        )}
        {action.data.song && (
          <div>
            <span className="text-gray-400">Song: </span>
            <span className="text-cyan-800 font-semibold">{action.data.song}</span>
          </div>
        )}
        {action.data.message && (
          <div>
            <span className="text-gray-400">Message: </span>
            <span className="text-emerald-800 font-medium">&ldquo;{action.data.message}&rdquo;</span>
          </div>
        )}
        {action.data.phone && (
          <div>
            <span className="text-gray-400">Phone: </span>
            <span className="text-emerald-800">{action.data.phone}</span>
          </div>
        )}
        {action.data.destination && (
          <div>
            <span className="text-gray-400">Destination: </span>
            <span className="text-amber-800 font-semibold">{action.data.destination}</span>
          </div>
        )}
        {action.data.minutes && (
          <div>
            <span className="text-gray-400">Timer: </span>
            <span className="text-cyan-800 font-semibold">{action.data.minutes} Minutes</span>
          </div>
        )}
        {action.data.reminder && (
          <div>
            <span className="text-gray-400">Reminder: </span>
            <span className="text-yellow-800 font-semibold">{action.data.reminder}</span>
          </div>
        )}
        {action.data.number && (
          <div>
            <span className="text-gray-400">Dial: </span>
            <span className="text-green-800 font-semibold">{action.data.number}</span>
          </div>
        )}
      </div>

      {meta.needsSensitiveConfirm && status === 'pending' && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 mb-2">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Requires user confirmation before launching external application.</span>
        </div>
      )}

      {status === 'pending' ? (
        <div className="flex items-center gap-2">
          <button
            onClick={handleExecute}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white shadow-xs active:scale-98 transition-all cursor-pointer"
          >
            {meta.btnText}
            {meta.isExternal && <ExternalLink className="w-3 h-3" />}
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-800 bg-white border border-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="text-[11px] text-gray-500 italic">
          {status === 'executed' ? 'Action executed.' : 'Action dismissed.'}
        </div>
      )}
    </div>
  );
};
