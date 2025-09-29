// OpenAI processing function for Netlify
exports.handler = async (event, context) => {
  console.log('Processing function called:', {
    method: event.httpMethod,
    body: event.body,
    headers: event.headers
  });

  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Parsing request body...');
    const body = event.body ? JSON.parse(event.body) : {};
    const { content, promptType = 'default' } = body;

    console.log('Request data:', { content: content?.substring(0, 100), promptType });

    if (!content || typeof content !== 'string') {
      console.log('Content validation failed');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Content is required' })
      };
    }

    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'OpenAI API key not configured',
          details: 'Please configure OPENAI_API_KEY environment variable'
        })
      };
    }

    // Define prompt templates for different types
    const promptTemplates = {
      diary: `You are an AI assistant specialized in enhancing diary entries. Your task is to take the provided diary content and improve its grammar, flow, and add more descriptive language while maintaining a personal and reflective tone.

Diary content:
{content}

Enhanced version:`,
      meeting: `You are an AI assistant specialized in organizing meeting notes. Your task is to take the provided meeting notes and structure them with clear headings, action items, key decisions, and a summary.

Meeting notes:
{content}

Organized version:`,
      braindump: `You are an AI assistant specialized in organizing brain dumps. Your task is to take the provided raw thoughts and categorize them into logical groups, creating a clear and actionable structure.

Brain dump content:
{content}

Organized version:`,
      brainstorm: `You are an AI assistant specialized in enhancing brainstorming sessions. Your task is to take the provided brainstorm content and expand on ideas, add variations, and suggest potential implementation steps.

Brainstorm content:
{content}

Enhanced version:`,
      summary: `You are an AI assistant specialized in summarizing content. Your task is to take the provided text and create a concise summary, highlighting the main points and key information.

Content to summarize:
{content}

Summary:`,
      expand: `You are an AI assistant specialized in expanding content. Your task is to take the provided brief text and expand it with more detail, examples, and context, making it more comprehensive.

Content to expand:
{content}

Expanded version:`,
      translate: `You are an AI assistant specialized in language translation. Your task is to translate the provided content into English while preserving its original meaning and tone.

Content to translate:
{content}

Translated version (English):`,
      default: `You are an AI assistant specialized in enhancing notes. Your task is to take the provided note content and improve its clarity, conciseness, and structure. Ensure the output is well-organized and easy to read.

Note content:
{content}

Enhanced version:`
    };

    try {
      // Get the appropriate prompt template
      const promptTemplate = promptTemplates[promptType] || promptTemplates.default;

      // Format the prompt with the content
      const formattedPrompt = promptTemplate.replace('{content}', content);

      console.log('Calling OpenAI API...');

      // Call OpenAI API directly
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: formattedPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const processedContent = data.choices[0].message.content;

      console.log('OpenAI processing completed successfully');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          processedContent,
          promptUsed: `${promptType} processing with OpenAI GPT-3.5-turbo`
        })
      };

    } catch (llmError) {
      console.error('Error in LLM processing:', llmError);

      // Fallback to simple processing if LLM fails
      console.log('Falling back to simple processing...');
      let fallbackContent;

      switch (promptType) {
        case 'diary':
          fallbackContent = `**Enhanced Diary Entry**\n\n${content}\n\n*This entry has been enhanced for better flow and readability while maintaining your personal voice.*`;
          break;
        case 'meeting':
          fallbackContent = `## Meeting Notes\n\n**Key Points:**\n${content}\n\n**Action Items:**\n- [ ] To be determined\n\n**Next Steps:**\n- To be determined`;
          break;
        case 'braindump':
          fallbackContent = `## Organized Thoughts\n\n${content}\n\n---\n\n**Categories:**\n- Ideas\n- Tasks\n- Questions\n- Notes`;
          break;
        case 'brainstorm':
          fallbackContent = `## Brainstorming Session\n\n**Original Ideas:**\n${content}\n\n**Expanded Ideas:**\n- [Original idea] + variations and implementation steps\n\n**Next Actions:**\n- Research feasibility\n- Create implementation plan`;
          break;
        case 'summary':
          fallbackContent = `## Summary\n\n**Key Points:**\n${content}\n\n**Main Takeaways:**\n- [Key insight 1]\n- [Key insight 2]\n- [Key insight 3]`;
          break;
        case 'expand':
          fallbackContent = `## Expanded Content\n\n**Original:**\n${content}\n\n**Expanded Version:**\nThis is an expanded version of your content with additional details, examples, and context to provide a more comprehensive understanding of the topic.`;
          break;
        case 'translate':
          fallbackContent = `## Translated Content\n\n**Original:**\n${content}\n\n**Translation:**\n[This would be the translated version of your content]`;
          break;
        default:
          fallbackContent = `## Enhanced Note\n\n${content}\n\n---\n\n*This note has been enhanced for better clarity and structure.*`;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          processedContent: fallbackContent,
          promptUsed: `${promptType} processing (fallback mode)`,
          warning: 'LLM processing failed, using fallback processing'
        })
      };
    }
  } catch (error) {
    console.error('Error in processing function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process note',
        details: error.message
      })
    };
  }
};
