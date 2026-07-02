require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');

const app = express();
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', rateLimit({ windowMs: 15*60*1000, max: 300, standardHeaders:true, legacyHeaders:false }));

app.use('/api/auth',            require('./routes/auth'));
app.use('/api/movies',          require('./routes/movies'));
app.use('/api/reviews',         require('./routes/reviews'));
app.use('/api/favorites',       require('./routes/favorites'));
app.use('/api/watchhistory',    require('./routes/watchHistory'));
app.use('/api/chatbot',         require('./routes/chatbot'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/ai-recommendations', require('./routes/aiRecommendations'));
app.use('/api/profiles',        require('./routes/profiles'));

app.get('/api/health', (req,res) => res.json({
  status:'OK', version:'2.0.0', timestamp:new Date().toISOString(),
  tmdb:!!process.env.TMDB_API_KEY, ai:!!process.env.ANTHROPIC_API_KEY,
}));

// 404 + error handler
app.use((req,res) => res.status(404).json({ error:`Route ${req.originalUrl} not found` }));
app.use((err,req,res,next) => {
  if (err.code===11000) return res.status(400).json({ error:'Already exists' });
  if (err.name==='ValidationError') return res.status(400).json({ error:Object.values(err.errors).map(e=>e.message).join('. ') });
  if (err.name==='JsonWebTokenError') return res.status(401).json({ error:'Invalid token' });
  console.error(err.stack);
  res.status(err.status||500).json({ error: process.env.NODE_ENV==='production'?'Server error':err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🎬  Shoufli Movie Server  →  http://localhost:${PORT}`);
  console.log(`🗄   MongoDB  →  ${process.env.MONGO_URI||'mongodb://localhost:27017/shoufli'}`);
  console.log(`🎥  TMDb API  →  ${process.env.TMDB_API_KEY ? '✅ configured' : '⚠️  not set (mock data)'}`);
  console.log(`🤖  AI        →  ${process.env.ANTHROPIC_API_KEY ? '✅ configured' : '⚠️  not set (rule-based fallback)'}\n`);
});

module.exports = app;
