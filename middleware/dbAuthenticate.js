const dbAuthenticate = (req, res, next) => {
    const backendApiKey = req.headers.authorization?.split(' ')[1]; // Extract Bearer token
    if (!backendApiKey || backendApiKey !== process.env.BACKEND_API_KEY) {
      return res.status(403).json({ message: 'Forbidden: Invalid Backend API Key' });
    }
    next(); // Proceed to the next middleware or route handler
  };
  
  module.exports = dbAuthenticate;
  