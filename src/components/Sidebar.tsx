import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  LogOut,
  Settings,
  Download,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { Conversation, User } from '../types';
import { ZeroxOrb } from './ZeroxOrb';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
  currentUser: User | null;
  onOpenSettings: () => void;
  onOpenTools: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onTogglePin,
  currentUser,
  onOpenSettings,
  onOpenTools,
  onOpenAuth,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const pinnedConvs = filtered.filter((c) => c.pinned);
  const unpinnedConvs = filtered.filter((c) => !c.pinned);

  const todayConvs: Conversation[] = [];
  const yesterdayConvs: Conversation[] = [];
  const weekConvs: Conversation[] = [];
  const olderConvs: Conversation[] = [];

  unpinnedConvs.forEach((c) => {
    const diff = now - c.updatedAt;
    if (diff < ONE_DAY) {
      todayConvs.push(c);
    } else if (diff < 2 * ONE_DAY) {
      yesterdayConvs.push(c);
    } else if (diff < 7 * ONE_DAY) {
      weekConvs.push(c);
    } else {
      olderConvs.push(c);
    }
  });

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleExport = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    const exportData = {
      title: conv.title,
      exportedAt: new Date().toISOString(),
      messages: conv.messages,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conv.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ChatGPT-style clean light Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 md:w-64 lg:w-72 bg-[#f9f9fb] border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & New Chat */}
        <div className="p-3 border-b border-gray-200/80 space-y-2.5 bg-[#f9f9fb]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ZeroxOrb size="sm" state="idle" />
              <div>
                <span className="text-sm font-extrabold tracking-tight text-gray-900">
                  Zerox GPT
                </span>
                <span className="text-[10px] font-semibold text-cyan-700 ml-1.5 px-1 py-0.5 rounded bg-cyan-100 font-mono">
                  Nano
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-800 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button (ChatGPT style) */}
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold shadow-xs transition-all cursor-pointer group active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-700 group-hover:rotate-90 transition-transform duration-200" />
              <span>New chat</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400 group-hover:text-gray-600">
              Ctrl+K
            </span>
          </button>

          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-400 text-xs">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40 text-gray-400" />
              {searchQuery ? 'No matching conversations' : 'No chats yet. Start a new chat!'}
            </div>
          ) : (
            <>
              {/* Pinned section */}
              {pinnedConvs.length > 0 && (
                <div className="space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-cyan-700" /> Pinned
                  </div>
                  {pinnedConvs.map((c) => (
                    <ConversationRow
                      key={c.id}
                      conversation={c}
                      isActive={activeConversationId === c.id}
                      isEditing={editingId === c.id}
                      editingTitle={editingTitle}
                      setEditingTitle={setEditingTitle}
                      onSelect={() => {
                        onSelectConversation(c.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      onSaveRename={(e) => handleSaveRename(c.id, e)}
                      onCancelRename={() => setEditingId(null)}
                      onStartRename={(e) => handleStartRename(c, e)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c.id);
                      }}
                      onTogglePin={(e) => {
                        e.stopPropagation();
                        onTogglePin(c.id);
                      }}
                      onExport={(e) => handleExport(c, e)}
                    />
                  ))}
                </div>
              )}

              {/* Today */}
              {todayConvs.length > 0 && (
                <div className="space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Today
                  </div>
                  {todayConvs.map((c) => (
                    <ConversationRow
                      key={c.id}
                      conversation={c}
                      isActive={activeConversationId === c.id}
                      isEditing={editingId === c.id}
                      editingTitle={editingTitle}
                      setEditingTitle={setEditingTitle}
                      onSelect={() => {
                        onSelectConversation(c.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      onSaveRename={(e) => handleSaveRename(c.id, e)}
                      onCancelRename={() => setEditingId(null)}
                      onStartRename={(e) => handleStartRename(c, e)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c.id);
                      }}
                      onTogglePin={(e) => {
                        e.stopPropagation();
                        onTogglePin(c.id);
                      }}
                      onExport={(e) => handleExport(c, e)}
                    />
                  ))}
                </div>
              )}

              {/* Yesterday */}
              {yesterdayConvs.length > 0 && (
                <div className="space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Yesterday
                  </div>
                  {yesterdayConvs.map((c) => (
                    <ConversationRow
                      key={c.id}
                      conversation={c}
                      isActive={activeConversationId === c.id}
                      isEditing={editingId === c.id}
                      editingTitle={editingTitle}
                      setEditingTitle={setEditingTitle}
                      onSelect={() => {
                        onSelectConversation(c.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      onSaveRename={(e) => handleSaveRename(c.id, e)}
                      onCancelRename={() => setEditingId(null)}
                      onStartRename={(e) => handleStartRename(c, e)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c.id);
                      }}
                      onTogglePin={(e) => {
                        e.stopPropagation();
                        onTogglePin(c.id);
                      }}
                      onExport={(e) => handleExport(c, e)}
                    />
                  ))}
                </div>
              )}

              {/* Previous 7 Days */}
              {weekConvs.length > 0 && (
                <div className="space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Previous 7 Days
                  </div>
                  {weekConvs.map((c) => (
                    <ConversationRow
                      key={c.id}
                      conversation={c}
                      isActive={activeConversationId === c.id}
                      isEditing={editingId === c.id}
                      editingTitle={editingTitle}
                      setEditingTitle={setEditingTitle}
                      onSelect={() => {
                        onSelectConversation(c.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      onSaveRename={(e) => handleSaveRename(c.id, e)}
                      onCancelRename={() => setEditingId(null)}
                      onStartRename={(e) => handleStartRename(c, e)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c.id);
                      }}
                      onTogglePin={(e) => {
                        e.stopPropagation();
                        onTogglePin(c.id);
                      }}
                      onExport={(e) => handleExport(c, e)}
                    />
                  ))}
                </div>
              )}

              {/* Older */}
              {olderConvs.length > 0 && (
                <div className="space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Older
                  </div>
                  {olderConvs.map((c) => (
                    <ConversationRow
                      key={c.id}
                      conversation={c}
                      isActive={activeConversationId === c.id}
                      isEditing={editingId === c.id}
                      editingTitle={editingTitle}
                      setEditingTitle={setEditingTitle}
                      onSelect={() => {
                        onSelectConversation(c.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      onSaveRename={(e) => handleSaveRename(c.id, e)}
                      onCancelRename={() => setEditingId(null)}
                      onStartRename={(e) => handleStartRename(c, e)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c.id);
                      }}
                      onTogglePin={(e) => {
                        e.stopPropagation();
                        onTogglePin(c.id);
                      }}
                      onExport={(e) => handleExport(c, e)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer User Bar */}
        <div className="p-2.5 border-t border-gray-200 bg-[#f9f9fb] space-y-1.5">
          <button
            onClick={onOpenTools}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-700" />
              <span>Actions & Tools Hub</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </button>

          <div className="flex items-center justify-between pt-1">
            {currentUser ? (
              <div
                onClick={onOpenSettings}
                className="flex items-center gap-2 flex-1 min-w-0 pr-2 cursor-pointer group p-1 rounded-lg hover:bg-gray-200/50"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.avatar || 'Z'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-gray-800 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">{currentUser.email}</div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="text-xs text-cyan-700 hover:text-cyan-800 font-semibold cursor-pointer px-2 py-1"
              >
                Sign In
              </button>
            )}

            <div className="flex items-center gap-0.5">
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 transition-colors cursor-pointer"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              {currentUser && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {/* Host Owners Attribution */}
          <div className="pt-1 px-1 text-center border-t border-gray-200/60">
            <span className="text-[10px] text-gray-400">
              Hosted by <strong className="text-gray-700 font-semibold">Arnav Sharma</strong> &amp; <strong className="text-gray-700 font-semibold">Akshit Kanswal</strong>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

interface RowProps {
  conversation: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editingTitle: string;
  setEditingTitle: (t: string) => void;
  onSelect: () => void;
  onSaveRename: (e: React.FormEvent) => void;
  onCancelRename: () => void;
  onStartRename: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onExport: (e: React.MouseEvent) => void;
}

const ConversationRow: React.FC<RowProps> = ({
  conversation,
  isActive,
  isEditing,
  editingTitle,
  setEditingTitle,
  onSelect,
  onSaveRename,
  onCancelRename,
  onStartRename,
  onDelete,
  onTogglePin,
  onExport,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
        isActive
          ? 'bg-[#ececf1] text-gray-900 font-medium'
          : 'text-gray-700 hover:bg-gray-200/60'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
        <MessageSquare
          className={`w-3.5 h-3.5 shrink-0 ${
            isActive ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'
          }`}
        />

        {isEditing ? (
          <form onSubmit={onSaveRename} className="flex-1 flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="w-full bg-white border border-cyan-500 rounded px-1.5 py-0.5 text-xs text-gray-900 focus:outline-none"
            />
            <button type="submit" className="text-emerald-600 hover:text-emerald-700">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={onCancelRename} className="text-gray-500 hover:text-gray-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <span className="truncate">{conversation.title}</span>
        )}
      </div>

      {!isEditing && (
        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <button
            onClick={onTogglePin}
            className={`p-1 rounded text-gray-400 hover:text-cyan-700 ${
              conversation.pinned ? 'text-cyan-700' : ''
            }`}
            title={conversation.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className={`w-3 h-3 ${conversation.pinned ? 'fill-cyan-700' : ''}`} />
          </button>
          <button
            onClick={onStartRename}
            className="p-1 rounded text-gray-400 hover:text-gray-700"
            title="Rename"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={onExport}
            className="p-1 rounded text-gray-400 hover:text-gray-700"
            title="Export JSON"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded text-gray-400 hover:text-rose-600"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
