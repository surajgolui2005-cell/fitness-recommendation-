const OpenAI = require('openai');

// Initialise OpenAI client using the API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openai;
