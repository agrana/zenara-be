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

export interface NoteVersion {
  id: string;
  noteId: string;
  userId: string;
  title: string;
  content: string;
  format: string;
  versionNumber: number;
  isProcessed: boolean;
  processingMetadata?: {
    model?: string;
    promptType?: string;
    provider?: string;
    temperature?: number;
  };
  createdAt: string;
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

  // Processing state
  isProcessingStream: boolean;
  processingProgress: string;
  processingError: string | null;

  // Versioning state
  versions: NoteVersion[];
  isLoadingVersions: boolean;
  versionError: string | null;

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
  immediateSave: (title: string, content: string) => Promise<void>;
  switchToNote: (note: Note | null, currentTitle: string, currentContent: string) => Promise<void>;
  setAutoSaveError: (error: string | null) => void;

  // Processing actions
  processContentStream: (content: string, promptType?: string, customPrompt?: string, promptId?: string) => Promise<void>;
  setProcessingError: (error: string | null) => void;

  // Versioning actions
  createVersion: (noteId: string, title: string, content: string, isProcessed?: boolean, processingMetadata?: any) => Promise<void>;
  fetchVersions: (noteId: string) => Promise<void>;
  restoreVersion: (version: NoteVersion) => Promise<void>;
  deleteVersion: (versionId: string) => Promise<void>;
  setVersionError: (error: string | null) => void;

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

  // Processing state
  isProcessingStream: false,
  processingProgress: '',
  processingError: null,

  // Versioning state
  versions: [],
  isLoadingVersions: false,
  versionError: null,

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

      // Create a version after successful save
      await get().createVersion(id, title, content);
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
        // Create new note - only if we have meaningful content
        if (content.trim().length > 0) {
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
        } else {
          set({ isAutoSaving: false });
        }
      }
    } catch (error) {
      console.error('Error autosaving note:', error);
      set({
        isAutoSaving: false,
        autoSaveError: 'Failed to autosave note'
      });
    }
  },

  immediateSave: async (title: string, content: string) => {
    // Immediate save without debounce - for critical moments like tab switch
    if (!content.trim()) return;

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
          lastAutoSaved: new Date()
        });
      } else if (content.trim().length > 0) {
        // Create new note immediately
        const { data, error } = await supabase
          .from('notes')
          .insert([{ title: title || 'Untitled Note', content }])
          .select()
          .single();

        if (error) throw error;

        set({
          notes: [data, ...get().notes],
          currentNote: data,
          lastAutoSaved: new Date()
        });
      }
    } catch (error) {
      console.error('Error in immediate save:', error);
      set({ autoSaveError: 'Failed to save note immediately' });
    }
  },

  switchToNote: async (note: Note | null, currentTitle: string, currentContent: string) => {
    // Save current note before switching
    if (currentContent.trim()) {
      await get().immediateSave(currentTitle, currentContent);
    }
    // Then switch to the new note
    set({ currentNote: note });
  },

  setAutoSaveError: (error) => set({ autoSaveError: error }),

  // Processing functions
  processContentStream: async (content: string, promptType = 'default', customPrompt?: string, promptId?: string) => {
    if (!content.trim()) return;

    set({
      isProcessingStream: true,
      processingProgress: '',
      processingError: null,
      processedContent: null
    });

    try {
      const response = await fetch('/.netlify/functions/process-note-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          promptType,
          customPrompt,
          promptId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start processing');
      }

      // Handle non-streaming response from Netlify function
      const result = await response.json();

      if (result.success) {
        set({
          isProcessingStream: false,
          processingProgress: 'Processing complete!',
          processedContent: result.processedContent
        });
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Error in streaming processing:', error);
      set({
        isProcessingStream: false,
        processingError: error instanceof Error ? error.message : 'Processing failed'
      });
    }
  },

  setProcessingError: (error) => set({ processingError: error }),

  // Versioning functions
  createVersion: async (noteId: string, title: string, content: string, isProcessed = false, processingMetadata?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found for creating version');
      return;
    }

    try {
      const { format } = get();
      
      const response = await fetch('/api/note-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId,
          userId: user.id,
          title,
          content,
          format,
          isProcessed,
          processingMetadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create version');
      }

      // Optionally refresh versions list if we're viewing this note's versions
      const currentVersions = get().versions;
      if (currentVersions.length > 0 && currentVersions[0]?.noteId === noteId) {
        await get().fetchVersions(noteId);
      }
    } catch (error) {
      console.error('Error creating version:', error);
      set({ versionError: error instanceof Error ? error.message : 'Failed to create version' });
    }
  },

  fetchVersions: async (noteId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    set({ isLoadingVersions: true, versionError: null });
    try {
      const response = await fetch(`/api/note-versions/${noteId}?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }

      const versions = await response.json();
      set({ versions, isLoadingVersions: false });
    } catch (error) {
      console.error('Error fetching versions:', error);
      set({
        versionError: error instanceof Error ? error.message : 'Failed to fetch versions',
        isLoadingVersions: false
      });
    }
  },

  restoreVersion: async (version: NoteVersion) => {
    try {
      // Update the current note with the version content
      if (get().currentNote?.id === version.noteId) {
        set({
          currentNote: {
            ...get().currentNote!,
            title: version.title,
            content: version.content,
          }
        });
      }

      // Save the restored content as the current version
      await get().updateNote(version.noteId, version.title, version.content);

      // Create a new version marking this as a restore
      await get().createVersion(
        version.noteId,
        version.title,
        version.content,
        false,
        { restoredFrom: version.id, restoredFromVersion: version.versionNumber }
      );
    } catch (error) {
      console.error('Error restoring version:', error);
      set({ versionError: error instanceof Error ? error.message : 'Failed to restore version' });
    }
  },

  deleteVersion: async (versionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const response = await fetch(`/api/note-versions/${versionId}?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete version');
      }

      // Remove from local state
      set({ versions: get().versions.filter(v => v.id !== versionId) });
    } catch (error) {
      console.error('Error deleting version:', error);
      set({ versionError: error instanceof Error ? error.message : 'Failed to delete version' });
    }
  },

  setVersionError: (error) => set({ versionError: error })
}));
