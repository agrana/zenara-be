// Simple processing function for Netlify
export const handler = async (event, context) => {
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

    // Simple processing logic for now - this will be replaced with actual LangChain integration
    let processedContent;
    
    switch (promptType) {
      case 'diary':
        processedContent = `**Enhanced Diary Entry**\n\n${content}\n\n*This entry has been enhanced for better flow and readability while maintaining your personal voice.*`;
        break;
      case 'meeting':
        processedContent = `## Meeting Notes\n\n**Key Points:**\n${content}\n\n**Action Items:**\n- [ ] To be determined\n\n**Next Steps:**\n- To be determined`;
        break;
      case 'braindump':
        processedContent = `## Organized Thoughts\n\n${content}\n\n---\n\n**Categories:**\n- Ideas\n- Tasks\n- Questions\n- Notes`;
        break;
      case 'brainstorm':
        processedContent = `## Brainstorming Session\n\n**Original Ideas:**\n${content}\n\n**Expanded Ideas:**\n- [Original idea] + variations and implementation steps\n\n**Next Actions:**\n- Research feasibility\n- Create implementation plan`;
        break;
      case 'summary':
        processedContent = `## Summary\n\n**Key Points:**\n${content}\n\n**Main Takeaways:**\n- [Key insight 1]\n- [Key insight 2]\n- [Key insight 3]`;
        break;
      case 'expand':
        processedContent = `## Expanded Content\n\n**Original:**\n${content}\n\n**Expanded Version:**\nThis is an expanded version of your content with additional details, examples, and context to provide a more comprehensive understanding of the topic.`;
        break;
      case 'translate':
        processedContent = `## Translated Content\n\n**Original:**\n${content}\n\n**Translation:**\n[This would be the translated version of your content]`;
        break;
      default:
        processedContent = `## Enhanced Note\n\n${content}\n\n---\n\n*This note has been enhanced for better clarity and structure.*`;
    }
    
    console.log('Processing completed successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        processedContent,
        promptUsed: `${promptType} processing`
      })
    };
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
