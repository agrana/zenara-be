import { supabase } from './db';

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

// Enhanced predefined prompts with more variety
export const PREDEFINED_PROMPTS = {
  diary: {
    name: 'Diary Enhancement',
    description: 'Improves grammar, flow, and adds descriptive language while maintaining personal tone',
    template: `You are a helpful writing assistant. Please enhance this diary entry by:

1. Improving grammar and flow
2. Adding more descriptive language where appropriate
3. Suggesting better word choices
4. Maintaining the personal, reflective tone
5. Adding emotional depth where appropriate

Original diary entry:
{content}

Enhanced version:`
  },
  meeting: {
    name: 'Meeting Notes Organization',
    description: 'Structures meeting notes with clear headings, action items, and key decisions',
    template: `You are a professional meeting assistant. Please organize and enhance these meeting notes by:

1. Structuring the content with clear headings
2. Extracting and highlighting action items
3. Summarizing key decisions
4. Improving clarity and readability
5. Adding missing context where helpful

Original meeting notes:
{content}

Organized version:`
  },
  braindump: {
    name: 'Brain Dump Organization',
    description: 'Categorizes thoughts into logical groups and creates clear structure',
    template: `You are a productivity assistant. Please organize this brain dump by:

1. Categorizing thoughts into logical groups
2. Creating a clear structure with headings
3. Identifying actionable items vs. ideas
4. Improving clarity and readability
5. Prioritizing items by importance

Original brain dump:
{content}

Organized version:`
  },
  brainstorm: {
    name: 'Brainstorm Enhancement',
    description: 'Expands on ideas, adds variations, and suggests implementation steps',
    template: `You are a creative thinking assistant. Please enhance this brainstorming session by:

1. Expanding on promising ideas
2. Adding related concepts and variations
3. Organizing ideas by theme or category
4. Suggesting next steps for implementation
5. Identifying potential challenges and solutions

Original brainstorm:
{content}

Enhanced version:`
  },
  summary: {
    name: 'Content Summarization',
    description: 'Creates concise summaries while preserving key information',
    template: `You are a summarization expert. Please create a clear, concise summary of this content by:

1. Identifying the main points and key information
2. Removing redundant or less important details
3. Maintaining the original meaning and context
4. Using clear, readable language
5. Organizing information logically

Original content:
{content}

Summary:`
  },
  expand: {
    name: 'Content Expansion',
    description: 'Expands brief content with more detail, examples, and context',
    template: `You are a content expansion specialist. Please expand this content by:

1. Adding relevant details and context
2. Providing examples and explanations
3. Including related information
4. Improving structure and flow
5. Maintaining the original intent

Original content:
{content}

Expanded version:`
  },
  translate: {
    name: 'Language Translation',
    description: 'Translates content to different languages while preserving meaning',
    template: `You are a professional translator. Please translate this content to {targetLanguage} by:

1. Maintaining the original meaning and tone
2. Using natural, fluent language
3. Preserving cultural context where appropriate
4. Keeping the same structure and format
5. Ensuring accuracy and clarity

Original content:
{content}

Translated version:`
  },
  default: {
    name: 'General Note Enhancement',
    description: 'General purpose enhancement for any type of note',
    template: `You are a helpful writing assistant. Please enhance this note by:

1. Improving grammar and clarity
2. Better organizing the content
3. Adding structure where helpful
4. Maintaining the original intent and tone
5. Making it more engaging and readable

Original note:
{content}

Enhanced version:`
  }
};

export class PromptService {
  private static instance: PromptService;

  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  /**
   * Get all prompts for a user (including defaults)
   */
  async getUserPrompts(userId?: string): Promise<Prompt[]> {
    try {
      // Get user's custom prompts
      const { data: userPrompts, error: userError } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      // Convert predefined prompts to Prompt format
      const defaultPrompts: Prompt[] = Object.entries(PREDEFINED_PROMPTS).map(([key, prompt]) => ({
        id: `default_${key}`,
        name: prompt.name,
        templateType: key,
        promptText: prompt.template,
        isDefault: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Combine user prompts with defaults
      const allPrompts = [...(userPrompts || []), ...defaultPrompts];

      return allPrompts;
    } catch (error) {
      console.error('Error getting user prompts:', error);
      throw new Error('Failed to get prompts');
    }
  }

  /**
   * Get prompts by template type
   */
  async getPromptsByType(templateType: string, userId?: string): Promise<Prompt[]> {
    const allPrompts = await this.getUserPrompts(userId);
    return allPrompts.filter(prompt => prompt.templateType === templateType);
  }

  /**
   * Create a new custom prompt
   */
  async createPrompt(data: CreatePromptData): Promise<Prompt> {
    try {
      const { data: prompt, error } = await supabase
        .from('prompts')
        .insert([{
          user_id: data.userId,
          name: data.name,
          template_type: data.templateType,
          prompt_text: data.promptText,
          is_default: data.isDefault || false,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      return prompt;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw new Error('Failed to create prompt');
    }
  }

  /**
   * Update an existing prompt
   */
  async updatePrompt(id: string, data: UpdatePromptData): Promise<Prompt> {
    try {
      const { data: prompt, error } = await supabase
        .from('prompts')
        .update({
          name: data.name,
          prompt_text: data.promptText,
          is_active: data.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return prompt;
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw new Error('Failed to update prompt');
    }
  }

  /**
   * Delete a prompt
   */
  async deletePrompt(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw new Error('Failed to delete prompt');
    }
  }

  /**
   * Get a specific prompt by ID
   */
  async getPromptById(id: string): Promise<Prompt | null> {
    try {
      // Check if it's a default prompt
      if (id.startsWith('default_')) {
        const templateType = id.replace('default_', '');
        const predefined = PREDEFINED_PROMPTS[templateType as keyof typeof PREDEFINED_PROMPTS];
        if (predefined) {
          return {
            id,
            name: predefined.name,
            templateType,
            promptText: predefined.template,
            isDefault: true,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      }

      // Get custom prompt from database
      const { data: prompt, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return prompt;
    } catch (error) {
      console.error('Error getting prompt by ID:', error);
      return null;
    }
  }

  /**
   * Get available template types with descriptions
   */
  getTemplateTypes(): Record<string, { name: string; description: string }> {
    return Object.entries(PREDEFINED_PROMPTS).reduce((acc, [key, prompt]) => {
      acc[key] = {
        name: prompt.name,
        description: prompt.description
      };
      return acc;
    }, {} as Record<string, { name: string; description: string }>);
  }
}
