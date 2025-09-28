// Simple processing function for Netlify
export const handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { content, promptType = 'default' } = JSON.parse(event.body);
    
    if (!content || typeof content !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Content is required' })
      };
    }

    // Simple processing logic for now
    const processedContent = `Processed with ${promptType}: ${content}`;

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
      body: JSON.stringify({ error: 'Failed to process note' })
    };
  }
};
