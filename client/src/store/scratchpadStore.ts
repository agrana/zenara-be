import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FormatType = 'default' | 'diary' | 'meeting' | 'braindump' | 'brainstorm';

export interface ScratchpadState {
  content: string;
  format: FormatType;
  processedContent: string | null;
  isProcessing: boolean;
  
  // Actions
  setContent: (content: string) => void;
  setFormat: (format: FormatType) => void;
  setProcessedContent: (content: string | null) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  processContent: () => Promise<void>;
  
  // Format templates
  getFormatTemplate: (format: FormatType) => string;
}

export const useScratchpadStore = create<ScratchpadState>()(
  persist(
    (set, get) => ({
      content: '',
      format: 'default',
      processedContent: null,
      isProcessing: false,
      
      setContent: (content) => set({ content }),
      
      setFormat: (format) => set({ format }),
      
      setProcessedContent: (content) => set({ processedContent: content }),
      
      setIsProcessing: (isProcessing) => set({ isProcessing }),
      
      processContent: async () => {
        const { content, format } = get();
        
        if (!content) {
          return;
        }
        
        set({ isProcessing: true });
        
        try {
          // Process on server-side
          const response = await fetch('/api/process-content', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content, format }),
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
      }
    }),
    {
      name: 'serene-start-scratchpad-storage'
    }
  )
);
