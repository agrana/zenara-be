import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';

export type FormatType = 'default' | 'diary' | 'meeting' | 'braindump' | 'brainstorm';

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ScratchpadState {
  notes: Note[];
  currentNote: Note | null;
  format: FormatType;
  processedContent: string | null;
  isProcessing: boolean;
  isLoading: boolean;
  error: string | null;

  // Autosave state
  isAutoSaving: boolean;
  lastAutoSaved: Date | null;
  autoSaveError: string | null;

  // Actions
  fetchNotes: () => Promise<void>;
  createNote: (title: string, content: string) => Promise<void>;
  updateNote: (id: string, title: string, content: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
  setFormat: (format: FormatType) => void;
  setProcessedContent: (content: string | null) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  processContent: () => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Autosave actions
  autoSaveNote: (title: string, content: string) => Promise<void>;
  setAutoSaveError: (error: string | null) => void;

  // Format templates
  getFormatTemplate: (format: FormatType) => string;
}

export const useScratchpadStore = create<ScratchpadState>()((set, get) => ({
  notes: [],
  currentNote: null,
  format: 'default',
  processedContent: null,
  isProcessing: false,
  isLoading: false,
  error: null,

  // Autosave state
  isAutoSaving: false,
  lastAutoSaved: null,
  autoSaveError: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      set({ notes: data || [], isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch notes', isLoading: false });
      console.error('Error fetching notes:', error);
    }
  },

  createNote: async (title: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ title, content }])
        .select()
        .single();

      if (error) throw error;
      set({
        notes: [data, ...get().notes],
        currentNote: data,
        isLoading: false
      });
    } catch (error) {
      set({ error: 'Failed to create note', isLoading: false });
      console.error('Error creating note:', error);
    }
  },

  updateNote: async (id: string, title: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set({
        notes: get().notes.map(note => note.id === id ? data : note),
        currentNote: data,
        isLoading: false
      });
    } catch (error) {
      set({ error: 'Failed to update note', isLoading: false });
      console.error('Error updating note:', error);
    }
  },

  setCurrentNote: (note) => set({ currentNote: note }),

  setFormat: (format) => set({ format }),

  setProcessedContent: (content) => set({ processedContent: content }),

  setIsProcessing: (isProcessing) => set({ isProcessing }),

  processContent: async () => {
    const { currentNote } = get();

    if (!currentNote?.content) {
      return;
    }

    set({ isProcessing: true });

    try {
      const response = await fetch('/api/process-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: currentNote.content, format: get().format }),
      });

      if (!response.ok) {
        throw new Error('Failed to process content');
      }

      const data = await response.json();
      set({ processedContent: data.processedContent, isProcessing: false });
    } catch (error) {
      console.error('Error processing content:', error);
      set({ isProcessing: false });
    }
  },

  deleteNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      set({
        notes: get().notes.filter(note => note.id !== id),
        currentNote: null,
        isLoading: false
      });
    } catch (error) {
      set({ error: 'Failed to delete note', isLoading: false });
      console.error('Error deleting note:', error);
    }
  },

  getFormatTemplate: (format) => {
    switch (format) {
      case 'diary':
        return "# Dear Diary\n\nToday I...\n\n## Highlights\n\n- \n\n## Mood\n\n- \n\n## Tomorrow I will\n\n- ";

      case 'meeting':
        return "# Meeting Notes\n\n**Date:** \n**Attendees:** \n\n## Agenda\n\n1. \n\n## Decisions\n\n- \n\n## Action Items\n\n- [ ] \n\n## Notes\n\n";

      case 'braindump':
        return "# Brain Dump\n\n## Thoughts\n\n- \n\n## Questions\n\n- \n\n## Ideas\n\n- ";

      case 'brainstorm':
        return "# Brainstorming Session\n\n## Topic\n\n\n## Ideas\n\n- \n\n## Pros and Cons\n\n| Idea | Pros | Cons |\n| ---- | ---- | ---- |\n|      |      |      |\n\n## Action Items\n\n- [ ] ";

      case 'default':
      default:
        return "";
    }
  },

  // Autosave functions
  autoSaveNote: async (title: string, content: string) => {
    // Don't autosave if there's no content or if already saving
    if (!content.trim() || get().isAutoSaving) return;

    set({ isAutoSaving: true, autoSaveError: null });

    try {
      const { currentNote } = get();

      if (currentNote) {
        // Update existing note
        const { data, error } = await supabase
          .from('notes')
          .update({ title, content })
          .eq('id', currentNote.id)
          .select()
          .single();

        if (error) throw error;

        set({
          notes: get().notes.map(note => note.id === currentNote.id ? data : note),
          currentNote: data,
          isAutoSaving: false,
          lastAutoSaved: new Date()
        });
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('notes')
          .insert([{ title: title || 'Untitled Note', content }])
          .select()
          .single();

        if (error) throw error;

        set({
          notes: [data, ...get().notes],
          currentNote: data,
          isAutoSaving: false,
          lastAutoSaved: new Date()
        });
      }
    } catch (error) {
      console.error('Error autosaving note:', error);
      set({
        isAutoSaving: false,
        autoSaveError: 'Failed to autosave note'
      });
    }
  },

  setAutoSaveError: (error) => set({ autoSaveError: error })
}));
