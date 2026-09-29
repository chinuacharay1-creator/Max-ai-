import React, { useState } from "react";
import { X, Brain, Plus, Trash2, Globe, FileText, Check, ShieldCheck, Copy, Sparkles } from "lucide-react";
import {
  UserPreferences,
  VoiceNote,
  savePreferences,
  addVoiceNote,
  deleteVoiceNote,
  clearMemory,
} from "../services/memoryStorage";

interface MemoryAndNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

export const MemoryAndNotesModal: React.FC<MemoryAndNotesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
}) => {
  const [activeTab, setActiveTab] = useState<"notes" | "prefs" | "shortcuts">("notes");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    const note = addVoiceNote(newNoteTitle, newNoteContent);
    onUpdatePreferences({
      ...preferences,
      notes: [note, ...preferences.notes],
    });
    setNewNoteTitle("");
    setNewNoteContent("");
  };

  const handleDeleteNote = (id: string) => {
    deleteVoiceNote(id);
    onUpdatePreferences({
      ...preferences,
      notes: preferences.notes.filter((n) => n.id !== id),
    });
  };

  const handleLanguageChange = (lang: UserPreferences["language"]) => {
    const updated = { ...preferences, language: lang };
    savePreferences(updated);
    onUpdatePreferences(updated);
  };

  const handleConfirmationToggle = () => {
    const updated = {
      ...preferences,
      requiresConfirmation: !preferences.requiresConfirmation,
    };
    savePreferences(updated);
    onUpdatePreferences(updated);
  };

  const handleForgetMemory = () => {
    if (window.confirm("Are you sure you want MAX to forget all saved notes and conversation context?")) {
      clearMemory();
      onUpdatePreferences({
        ...preferences,
        notes: [],
        conversationHistory: [],
      });
    }
  };

  const copyNote = (note: VoiceNote) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const languages: UserPreferences["language"][] = ["Hinglish", "Hindi", "English", "Odia"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-purple-500/40 bg-slate-900/95 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono">🧠 MAX Memory & Voice Notes</h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-semibold uppercase">
                  Persistent Context
                </span>
              </div>
              <p className="text-xs text-slate-400">
                User preferences, saved thoughts, voice notes & shortcuts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 text-xs font-medium">
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "notes"
                ? "border-purple-400 text-purple-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Voice Notes ({preferences.notes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("prefs")}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "prefs"
                ? "border-purple-400 text-purple-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Language & Privacy</span>
          </button>
          <button
            onClick={() => setActiveTab("shortcuts")}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "shortcuts"
                ? "border-purple-400 text-purple-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Frequent Websites</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-4">
          {activeTab === "notes" && (
            <div className="space-y-4">
              {/* Note Creator Form */}
              <form onSubmit={handleCreateNote} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note Title (e.g. 'Project Idea', 'Free Fire sensitivity')"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Note Content or say 'MAX, ye note kar lo'..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newNoteContent.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              {/* Note List */}
              <div className="space-y-2">
                {preferences.notes.length > 0 ? (
                  preferences.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-purple-500/40 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-200 text-xs">{note.title}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">{note.timestamp}</span>
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => copyNote(note)}
                          title="Copy Note"
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          title="Delete Note"
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    No notes saved yet. Tell MAX: &quot;MAX, ye note kar lo&quot;!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "prefs" && (
            <div className="space-y-4">
              {/* Language Selection */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="font-semibold text-slate-200 mb-2">Preferred Spoken Language</h3>
                <p className="text-slate-400 text-xs mb-3">
                  Choose how MAX primarily communicates with you:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {languages.map((l) => (
                    <button
                      key={l}
                      onClick={() => handleLanguageChange(l)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        preferences.language === l
                          ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-500/20"
                          : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirmation Preference */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-200">Confirmation System</h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Ask for your explicit confirmation before opening external websites or launching PC tools.
                  </p>
                </div>
                <button
                  onClick={handleConfirmationToggle}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold cursor-pointer transition-colors ${
                    preferences.requiresConfirmation
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {preferences.requiresConfirmation ? "Enabled" : "Disabled"}
                </button>
              </div>

              {/* Forget Memory Button */}
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-red-200">&quot;Forget This&quot; / Clear Memory</h3>
                  <p className="text-red-300/70 text-xs mt-0.5">
                    Clear stored conversation context, history, and voice notes.
                  </p>
                </div>
                <button
                  onClick={handleForgetMemory}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  Reset Memory
                </button>
              </div>
            </div>
          )}

          {activeTab === "shortcuts" && (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs">
                MAX tracks frequently opened websites so you can say &quot;MAX, open my favorite site&quot;.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {preferences.frequentlyUsedSites.map((site) => (
                  <div
                    key={site.name}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="font-semibold text-slate-200 text-xs">{site.name}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{site.url}</p>
                      </div>
                    </div>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono"
                    >
                      Open
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <span className="font-mono">Created by Chinu AI • Trimurti Sahi</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
