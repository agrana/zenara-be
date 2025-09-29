import { create } from 'zustand';

export interface Prompt {
  id: string;
  userId?: string;
  name: string;
  templateType: string;
  promptText: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptData {
  userId?: string;
  name: string;
  templateType: string;
  promptText: string;
  isDefault?: boolean;
}

export interface UpdatePromptData {
  name?: string;
  promptText?: string;
  isActive?: boolean;
}

export interface TemplateType {
  name: string;
  description: string;
}

export interface PromptState {
  prompts: Prompt[];
  templateTypes: Record<string, TemplateType>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPrompts: (userId?: string) => Promise<void>;
  fetchPromptsByType: (templateType: string, userId?: string) => Promise<void>;
  fetchTemplateTypes: () => Promise<void>;
  createPrompt: (data: CreatePromptData) => Promise<Prompt>;
  updatePrompt: (id: string, data: UpdatePromptData) => Promise<Prompt>;
  deletePrompt: (id: string) => Promise<void>;
  getPromptById: (id: string) => Promise<Prompt | null>;
  setError: (error: string | null) => void;
}

export const usePromptStore = create<PromptState>()((set, get) => ({
  prompts: [],
  templateTypes: {},
  isLoading: false,
  error: null,

  fetchPrompts: async (userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const url = userId ? `/api/prompts/user/${userId}` : '/api/prompts/user';
      const response = await fetch(url);

      if (!response.ok) {
        // If the endpoint doesn't exist yet, fall back to default prompts
        if (response.status === 404) {
          console.warn('Prompts API not available, using default prompts only');
          set({ prompts: [], isLoading: false });
          return;
        }
        throw new Error('Failed to fetch prompts');
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Prompts API returned non-JSON response, using default prompts only');
        set({ prompts: [], isLoading: false });
        return;
      }

      const prompts = await response.json();
      set({ prompts, isLoading: false });
    } catch (error) {
      console.error('Error fetching prompts:', error);
      // Don't show error to user, just use empty prompts (defaults will still work)
      set({
        prompts: [],
        isLoading: false
      });
    }
  },

  fetchPromptsByType: async (templateType: string, userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const url = userId
        ? `/api/prompts/template/${templateType}?userId=${userId}`
        : `/api/prompts/template/${templateType}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch prompts by type');
      }

      const prompts = await response.json();
      set({ prompts, isLoading: false });
    } catch (error) {
      console.error('Error fetching prompts by type:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch prompts by type',
        isLoading: false
      });
    }
  },

  fetchTemplateTypes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/prompts/templates/types');

      if (!response.ok) {
        // If the endpoint doesn't exist yet, use hardcoded template types
        if (response.status === 404) {
          console.warn('Template types API not available, using default types');
          const defaultTypes = {
            diary: { name: 'Diary Enhancement', description: 'Improves grammar, flow, and adds descriptive language while maintaining personal tone' },
            meeting: { name: 'Meeting Notes Organization', description: 'Structures meeting notes with clear headings, action items, and key decisions' },
            braindump: { name: 'Brain Dump Organization', description: 'Categorizes thoughts into logical groups and creates clear structure' },
            brainstorm: { name: 'Brainstorm Enhancement', description: 'Expands on ideas, adds variations, and suggests implementation steps' },
            summary: { name: 'Content Summarization', description: 'Creates concise summaries while preserving key information' },
            expand: { name: 'Content Expansion', description: 'Expands brief content with more detail, examples, and context' },
            translate: { name: 'Language Translation', description: 'Translates content to different languages while preserving meaning' },
            default: { name: 'General Note Enhancement', description: 'General purpose enhancement for any type of note' }
          };
          set({ templateTypes: defaultTypes, isLoading: false });
          return;
        }
        throw new Error('Failed to fetch template types');
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Template types API returned non-JSON response, using default types');
        const defaultTypes = {
          diary: { name: 'Diary Enhancement', description: 'Improves grammar, flow, and adds descriptive language while maintaining personal tone' },
          meeting: { name: 'Meeting Notes Organization', description: 'Structures meeting notes with clear headings, action items, and key decisions' },
          braindump: { name: 'Brain Dump Organization', description: 'Categorizes thoughts into logical groups and creates clear structure' },
          brainstorm: { name: 'Brainstorm Enhancement', description: 'Expands on ideas, adds variations, and suggests implementation steps' },
          summary: { name: 'Content Summarization', description: 'Creates concise summaries while preserving key information' },
          expand: { name: 'Content Expansion', description: 'Expands brief content with more detail, examples, and context' },
          translate: { name: 'Language Translation', description: 'Translates content to different languages while preserving meaning' },
          default: { name: 'General Note Enhancement', description: 'General purpose enhancement for any type of note' }
        };
        set({ templateTypes: defaultTypes, isLoading: false });
        return;
      }

      const templateTypes = await response.json();
      set({ templateTypes, isLoading: false });
    } catch (error) {
      console.error('Error fetching template types:', error);
      // Use default template types as fallback
      const defaultTypes = {
        diary: { name: 'Diary Enhancement', description: 'Improves grammar, flow, and adds descriptive language while maintaining personal tone' },
        meeting: { name: 'Meeting Notes Organization', description: 'Structures meeting notes with clear headings, action items, and key decisions' },
        braindump: { name: 'Brain Dump Organization', description: 'Categorizes thoughts into logical groups and creates clear structure' },
        brainstorm: { name: 'Brainstorm Enhancement', description: 'Expands on ideas, adds variations, and suggests implementation steps' },
        summary: { name: 'Content Summarization', description: 'Creates concise summaries while preserving key information' },
        expand: { name: 'Content Expansion', description: 'Expands brief content with more detail, examples, and context' },
        translate: { name: 'Language Translation', description: 'Translates content to different languages while preserving meaning' },
        default: { name: 'General Note Enhancement', description: 'General purpose enhancement for any type of note' }
      };
      set({
        templateTypes: defaultTypes,
        isLoading: false
      });
    }
  },

  createPrompt: async (data: CreatePromptData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create prompt');
      }

      const prompt = await response.json();

      // Add to local state
      set(state => ({
        prompts: [prompt, ...state.prompts],
        isLoading: false
      }));

      return prompt;
    } catch (error) {
      console.error('Error creating prompt:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create prompt',
        isLoading: false
      });
      throw error;
    }
  },

  updatePrompt: async (id: string, data: UpdatePromptData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update prompt');
      }

      const updatedPrompt = await response.json();

      // Update local state
      set(state => ({
        prompts: state.prompts.map(prompt =>
          prompt.id === id ? updatedPrompt : prompt
        ),
        isLoading: false
      }));

      return updatedPrompt;
    } catch (error) {
      console.error('Error updating prompt:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update prompt',
        isLoading: false
      });
      throw error;
    }
  },

  deletePrompt: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }

      // Remove from local state
      set(state => ({
        prompts: state.prompts.filter(prompt => prompt.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting prompt:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete prompt',
        isLoading: false
      });
      throw error;
    }
  },

  getPromptById: async (id: string) => {
    try {
      const response = await fetch(`/api/prompts/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to get prompt');
      }

      const prompt = await response.json();
      return prompt;
    } catch (error) {
      console.error('Error getting prompt by ID:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to get prompt'
      });
      return null;
    }
  },

  setError: (error) => set({ error })
}));
