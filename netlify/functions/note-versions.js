// Note versions API function for Netlify
exports.handler = async (event, context) => {
  console.log('Note versions function called:', {
    method: event.httpMethod,
    path: event.path,
    queryStringParameters: event.queryStringParameters
  });

  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    // For now, return empty array since we don't have full backend deployed
    // This prevents the JSON parsing error
    const versions = [];
    
    console.log('Returning empty versions array (full backend not deployed yet)');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(versions)
    };
  } catch (error) {
    console.error('Error in note versions function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch note versions',
        details: error.message
      })
    };
  }
};
