// Prompts templates API function for Netlify
exports.handler = async (event, context) => {
  console.log('Prompts templates function called:', {
    method: event.httpMethod,
    path: event.path
  });

  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Return default template types
    const templateTypes = {
      diary: { name: 'Diary Enhancement', description: 'Improves grammar, flow, and adds descriptive language while maintaining personal tone' },
      meeting: { name: 'Meeting Notes Organization', description: 'Structures meeting notes with clear headings, action items, and key decisions' },
      braindump: { name: 'Brain Dump Organization', description: 'Categorizes thoughts into logical groups and creates clear structure' },
      brainstorm: { name: 'Brainstorm Enhancement', description: 'Expands on ideas, adds variations, and suggests implementation steps' },
      summary: { name: 'Content Summarization', description: 'Creates concise summaries while preserving key information' },
      expand: { name: 'Content Expansion', description: 'Expands brief content with more detail, examples, and context' },
      translate: { name: 'Language Translation', description: 'Translates content to different languages while preserving meaning' },
      default: { name: 'General Note Enhancement', description: 'General purpose enhancement for any type of note' }
    };
    
    console.log('Returning template types');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(templateTypes)
    };
  } catch (error) {
    console.error('Error in prompts templates function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch template types',
        details: error.message
      })
    };
  }
};
