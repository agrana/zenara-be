// Prompts API function for Netlify
exports.handler = async (event, context) => {
  console.log('Prompts function called:', {
    method: event.httpMethod,
    path: event.path,
    queryStringParameters: event.queryStringParameters
  });

  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    // For now, return empty prompts array since we don't have the full prompt management system deployed
    // This prevents the JSON parsing error in the frontend
    const prompts = [];

    console.log('Returning empty prompts array');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(prompts)
    };
  } catch (error) {
    console.error('Error in prompts function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch prompts',
        details: error.message
      })
    };
  }
};
