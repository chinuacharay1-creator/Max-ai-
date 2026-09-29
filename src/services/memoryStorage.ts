/**
 * Persistent Memory Manager for MAX AI Assistant
 * Saves language preferences, notes, shortcuts, and conversation history.
 */

export interface VoiceNote {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface UserPreferences {
  language: "Hindi" | "Hinglish" | "English" | "Odia";
  activeMode: "normal" | "creator" | "study" | "gaming" | "night" | "silent";
  frequentlyUsedSites: { name: string; url: string; count: number }[];
  notes: VoiceNote[];
  conversationHistory: { role: "user" | "max"; text: string; time: string }[];
  requiresConfirmation: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: "Hinglish",
  activeMode: "normal",
  frequentlyUsedSites: [
    { name: "YouTube", url: "https://youtube.com", count: 12 },
    { name: "Google", url: "https://google.com", count: 9 },
    { name: "Instagram", url: "https://instagram.com", count: 7 },
    { name: "GitHub", url: "https://github.com", count: 4 },
  ],
  notes: [
    {
      id: "note-1",
      title: "Welcome to MAX",
      content: "Created by Chinu AI at Trimurti Sahi. Vision, live audio, and autonomous modes are online.",
      timestamp: new Date().toLocaleDateString(),
    },
  ],
  conversationHistory: [],
  requiresConfirmation: true,
};

const STORAGE_KEY = "max_assistant_memory_v1";

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error("[MemoryStorage] Error saving preferences:", e);
  }
}

export function addVoiceNote(title: string, content: string): VoiceNote {
  const prefs = loadPreferences();
  const newNote: VoiceNote = {
    id: "note-" + Date.now(),
    title: title || "Note " + (prefs.notes.length + 1),
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
  prefs.notes = [newNote, ...prefs.notes];
  savePreferences(prefs);
  return newNote;
}

export function deleteVoiceNote(id: string): void {
  const prefs = loadPreferences();
  prefs.notes = prefs.notes.filter((n) => n.id !== id);
  savePreferences(prefs);
}

export function clearMemory(): void {
  const prefs = loadPreferences();
  prefs.conversationHistory = [];
  prefs.notes = [];
  savePreferences(prefs);
}
