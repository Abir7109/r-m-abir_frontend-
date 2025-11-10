const { MongoClient } = require('mongodb');

// MongoDB connection
const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  cachedClient = client;
  return client;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('portfolio_bot');
    const collection = db.collection('learned_responses');

    if (req.method === 'GET') {
      // Fetch all learned responses
      const responses = await collection.find({}).toArray();
      
      res.status(200).json({
        success: true,
        version: '1.0',
        lastUpdated: new Date().toISOString().split('T')[0],
        learnedResponses: responses.map(item => ({
          question: item.question,
          answer: item.answer,
          category: item.category || 'user-contributed',
          timestamp: item.timestamp
        }))
      });
    } 
    else if (req.method === 'POST') {
      // Add new learned response
      const { question, answer, category } = req.body;
      
      if (!question || !answer) {
        return res.status(400).json({ 
          success: false, 
          error: 'Question and answer are required' 
        });
      }

      // Check if question already exists
      const existing = await collection.findOne({ 
        question: question.toLowerCase().trim() 
      });

      if (existing) {
        return res.status(409).json({ 
          success: false, 
          error: 'Question already exists' 
        });
      }

      // Insert new learned response
      const result = await collection.insertOne({
        question: question.toLowerCase().trim(),
        answer: answer,
        category: category || 'user-contributed',
        timestamp: new Date().toISOString(),
        approved: false // Require manual approval
      });

      res.status(201).json({
        success: true,
        message: 'Response saved successfully',
        id: result.insertedId
      });
    }
    else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: error.message 
    });
  }
};
