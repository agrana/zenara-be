export const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Netlify function is working!',
      method: event.httpMethod,
      timestamp: new Date().toISOString()
    })
  };
};
