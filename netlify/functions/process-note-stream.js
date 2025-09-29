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

    // Simple processing logic for now
    const processedContent = `Processed with ${promptType}: ${content}`;
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
