exports.handler = async (event) => {
  // Forward all query params to the frontend callback route
  const params = event.rawQuery ? `?${event.rawQuery}` : '';

  // Detect if running locally or in production
  const isLocal = process.env.NETLIFY_DEV === 'true';
  const frontendBase = isLocal
    ? 'http://localhost:5173'
    : 'https://zenara.be';

  return {
    statusCode: 302,
    headers: {
      Location: `${frontendBase}/auth/callback${params}`
    }
  };
};
