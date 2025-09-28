import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptService } from './promptService';

// Initialize OpenAI with streaming support
const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini', // Using mini for cost efficiency
  temperature: 0.7,
  streaming: true,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Predefined prompts for different note types
export const PREDEFINED_PROMPTS = {
  diary: {
    name: 'Diary Enhancement',
    template: `You are a helpful writing assistant. Please enhance this diary entry by:

1. Improving grammar and flow
2. Adding more descriptive language where appropriate
3. Suggesting better word choices
4. Maintaining the personal, reflective tone

Original diary entry:
{content}

Enhanced version:`
  },
  meeting: {
    name: 'Meeting Notes Organization',
    template: `You are a professional meeting assistant. Please organize and enhance these meeting notes by:

1. Structuring the content with clear headings
2. Extracting and highlighting action items
3. Summarizing key decisions
4. Improving clarity and readability

Original meeting notes:
{content}

Organized version:`
  },
  braindump: {
    name: 'Brain Dump Organization',
    template: `You are a productivity assistant. Please organize this brain dump by:

1. Categorizing thoughts into logical groups
2. Creating a clear structure with headings
3. Identifying actionable items vs. ideas
4. Improving clarity and readability

Original brain dump:
{content}

Organized version:`
  },
  brainstorm: {
    name: 'Brainstorm Enhancement',
    template: `You are a creative thinking assistant. Please enhance this brainstorming session by:

1. Expanding on promising ideas
2. Adding related concepts and variations
3. Organizing ideas by theme or category
4. Suggesting next steps for implementation

Original brainstorm:
{content}

Enhanced version:`
  },
  default: {
    name: 'General Note Enhancement',
    template: `You are a helpful writing assistant. Please enhance this note by:

1. Improving grammar and clarity
2. Better organizing the content
3. Adding structure where helpful
4. Maintaining the original intent and tone

Original note:
{content}

Enhanced version:`
  }
};

export interface ProcessingOptions {
  promptId?: string;
  promptType?: string;
  customPrompt?: string;
  userId?: string;
}

export interface ProcessingResult {
  success: boolean;
  processedContent?: string;
  error?: string;
  promptUsed?: string;
}

export class ProcessingService {
  private static instance: ProcessingService;

  public static getInstance(): ProcessingService {
    if (!ProcessingService.instance) {
      ProcessingService.instance = new ProcessingService();
    }
    return ProcessingService.instance;
  }

  /**
   * Process a note with streaming support
   */
  async processNoteStream(
    content: string,
    options: ProcessingOptions
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      // Get the prompt template
      let promptTemplate = options.customPrompt;
      let promptName = 'Custom Prompt';

      if (!promptTemplate) {
        const promptService = PromptService.getInstance();

        if (options.promptId) {
          // Get specific prompt by ID
          const prompt = await promptService.getPromptById(options.promptId);
          if (prompt) {
            promptTemplate = prompt.promptText;
            promptName = prompt.name;
          }
        } else if (options.promptType) {
          // Get default prompt by type
          const prompt = await promptService.getPromptById(`default_${options.promptType}`);
          if (prompt) {
            promptTemplate = prompt.promptText;
            promptName = prompt.name;
          }
        }

        // Fallback to default
        if (!promptTemplate) {
          const defaultPrompt = await promptService.getPromptById('default_default');
          promptTemplate = defaultPrompt?.promptText || PREDEFINED_PROMPTS.default.template;
          promptName = 'General Note Enhancement';
        }
      }

      // Create the prompt template
      const prompt = PromptTemplate.fromTemplate(promptTemplate);

      // Create the chain
      const chain = prompt.pipe(llm).pipe(new StringOutputParser());

      // Create a readable stream
      const encoder = new TextEncoder();

      return new ReadableStream({
        async start(controller) {
          try {
            // Send initial metadata
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'start',
              promptUsed: promptName
            })}\n\n`));

            // Stream the response
            const stream = await chain.stream({
              content: content
            });

            for await (const chunk of stream) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'chunk',
                content: chunk
              })}\n\n`));
            }

            // Send completion signal
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'complete'
            })}\n\n`));

            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: 'Processing failed'
            })}\n\n`));
            controller.close();
          }
        }
      });
    } catch (error) {
      console.error('Processing service error:', error);
      throw new Error('Failed to process note');
    }
  }

  /**
   * Process a note without streaming (for fallback)
   */
  async processNote(
    content: string,
    options: ProcessingOptions
  ): Promise<ProcessingResult> {
    try {
      // Get the prompt template (same logic as streaming)
      let promptTemplate = options.customPrompt;
      let promptName = 'Custom Prompt';

      if (!promptTemplate) {
        const promptService = PromptService.getInstance();

        if (options.promptId) {
          const prompt = await promptService.getPromptById(options.promptId);
          if (prompt) {
            promptTemplate = prompt.promptText;
            promptName = prompt.name;
          }
        } else if (options.promptType) {
          const prompt = await promptService.getPromptById(`default_${options.promptType}`);
          if (prompt) {
            promptTemplate = prompt.promptText;
            promptName = prompt.name;
          }
        }

        if (!promptTemplate) {
          const defaultPrompt = await promptService.getPromptById('default_default');
          promptTemplate = defaultPrompt?.promptText || PREDEFINED_PROMPTS.default.template;
          promptName = 'General Note Enhancement';
        }
      }

      const prompt = PromptTemplate.fromTemplate(promptTemplate);
      const chain = prompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        content: content
      });

      return {
        success: true,
        processedContent: result,
        promptUsed: promptName
      };
    } catch (error) {
      console.error('Processing error:', error);
      return {
        success: false,
        error: 'Failed to process note'
      };
    }
  }

  /**
   * Get available prompt types
   */
  getAvailablePrompts(): Record<string, { name: string; template: string }> {
    return PREDEFINED_PROMPTS;
  }

  /**
   * Get prompt service instance
   */
  getPromptService(): PromptService {
    return PromptService.getInstance();
  }
}
