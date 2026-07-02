const fetch = require('node-fetch');

const EMOTION_KW = {
  happy:   ['happy','joy','great','good','amazing','wonderful','fantastic','glad','laugh','fun'],
  sad:     ['sad','depress','cry','lonely','down','upset','bad','miss','heartbreak'],
  excited: ['excit','pump','hype','energy','thrill','ready','wow'],
  relaxed: ['relax','calm','chill','peace','easy','slow','tire','rest','sleep'],
  bored:   ['bored','boring','nothing','dull','empty','meh'],
  romantic:['love','romantic','date','crush','miss','heart','couple'],
  scared:  ['scar','afraid','anxious','nervous','worried','fear'],
  angry:   ['angry','mad','furious','annoy','frustrat','rage','stress'],
};

const EMOTION_DATA = {
  happy:   {msg:"You're feeling great! 🎉 Here are some fun movies!",       tmdbIds:[35,16,10751],emoji:'😊'},
  sad:     {msg:"Feeling down? 💙 These will lift your spirits:",             tmdbIds:[35,18,16],   emoji:'😢'},
  excited: {msg:"You're pumped! 🚀 Here are some epic picks:",               tmdbIds:[28,12,878],  emoji:'🤩'},
  relaxed: {msg:"Chill vibes 🌿 — some beautiful easy-going films:",         tmdbIds:[10749,18,99],emoji:'😌'},
  bored:   {msg:"Boredom ends now! ⚡ These will hook you instantly:",        tmdbIds:[53,28,878],  emoji:'😑'},
  romantic:{msg:"Romantic mood? 💕 Some beautiful love stories:",             tmdbIds:[10749,18,35],emoji:'💕'},
  scared:  {msg:"Feeling anxious? 🌟 Some light-hearted films to calm you:", tmdbIds:[35,16,12],   emoji:'😨'},
  angry:   {msg:"Need to let off steam? 💥 Some intense action:",            tmdbIds:[28,12,53],   emoji:'😠'},
};

const FALLBACK_MOVIES = {
  happy:   [{id:862,title:'Toy Story',emoji:'🤠',color:'#1a1a3a',cert:'G',rating:8.3},{id:13,title:'Forrest Gump',emoji:'🏃',color:'#1a3a1a',cert:'PG-13',rating:8.8},{id:14160,title:'Up',emoji:'🏠',color:'#1a3a3a',cert:'PG',rating:8.3}],
  sad:     [{id:637,title:'Life is Beautiful',emoji:'🌹',color:'#2a1a0a',cert:'PG-13',rating:8.6},{id:278,title:'The Shawshank Redemption',emoji:'🔓',color:'#2a1a0a',cert:'R',rating:9.3},{id:10681,title:'WALL·E',emoji:'🤖',color:'#1a2a3a',cert:'G',rating:8.4}],
  excited: [{id:24428,title:'The Avengers',emoji:'🛡️',color:'#1a0a0a',cert:'PG-13',rating:8.0},{id:157336,title:'Interstellar',emoji:'🚀',color:'#0a1a2a',cert:'PG-13',rating:8.7},{id:155,title:'The Dark Knight',emoji:'🦇',color:'#0a0a1a',cert:'PG-13',rating:9.0}],
  relaxed: [{id:637,title:'Life is Beautiful',emoji:'🌹',color:'#2a1a0a',cert:'PG-13',rating:8.6},{id:129,title:'Spirited Away',emoji:'🌸',color:'#2a1a2a',cert:'PG',rating:8.6},{id:10681,title:'WALL·E',emoji:'🤖',color:'#1a2a3a',cert:'G',rating:8.4}],
  bored:   [{id:603,title:'The Matrix',emoji:'💊',color:'#0a2a0a',cert:'R',rating:8.7},{id:155,title:'The Dark Knight',emoji:'🦇',color:'#0a0a1a',cert:'PG-13',rating:9.0},{id:157336,title:'Interstellar',emoji:'🚀',color:'#0a1a2a',cert:'PG-13',rating:8.7}],
  romantic:[{id:637,title:'Life is Beautiful',emoji:'🌹',color:'#2a1a0a',cert:'PG-13',rating:8.6},{id:13,title:'Forrest Gump',emoji:'🏃',color:'#1a3a1a',cert:'PG-13',rating:8.8},{id:77338,title:'The Intouchables',emoji:'🤝',color:'#0a1a2a',cert:'R',rating:8.5}],
  scared:  [{id:862,title:'Toy Story',emoji:'🤠',color:'#1a1a3a',cert:'G',rating:8.3},{id:10681,title:'WALL·E',emoji:'🤖',color:'#1a2a3a',cert:'G',rating:8.4},{id:129,title:'Spirited Away',emoji:'🌸',color:'#2a1a2a',cert:'PG',rating:8.6}],
  angry:   [{id:24428,title:'The Avengers',emoji:'🛡️',color:'#1a0a0a',cert:'PG-13',rating:8.0},{id:155,title:'The Dark Knight',emoji:'🦇',color:'#0a0a1a',cert:'PG-13',rating:9.0},{id:603,title:'The Matrix',emoji:'💊',color:'#0a2a0a',cert:'R',rating:8.7}],
};

const detectEmotion = (text) => {
  const lower = text.toLowerCase();
  let best = { e:'bored', s:0 };
  for (const [e,kws] of Object.entries(EMOTION_KW)) {
    const s = kws.filter(k=>lower.includes(k)).length;
    if (s>best.s) best = {e,s};
  }
  return best.e;
};

const fetchTMDbMovies = async (ids) => {
  const key = process.env.TMDB_API_KEY; if (!key) return null;
  try {
    const url = `${require('../controllers/moviesController').TMDB_BASE||'https://api.themoviedb.org/3'}/discover/movie?api_key=${key}&with_genres=${ids.slice(0,2).join(',')}&sort_by=popularity.desc&vote_count.gte=300&page=1`;
    const r = await fetch(url); const d = await r.json();
    return (d.results||[]).slice(0,5).map(m=>({id:m.id,title:m.title,poster_path:m.poster_path,vote_average:m.vote_average,year:m.release_date?.slice(0,4),overview:(m.overview||'').slice(0,100)+'…'}));
  } catch(e){ return null; }
};

const chat = async (req,res) => {
  try {
    const {message='',history=[],isChild=false} = req.body;
    if (!message.trim()) return res.status(400).json({error:'Message required'});
    const emotion = detectEmotion(message);
    const eData = EMOTION_DATA[emotion]||EMOTION_DATA.bored;

    let movies = null;
    if (!isChild) movies = await fetchTMDbMovies(eData.tmdbIds);
    if (!movies) {
      const fb = FALLBACK_MOVIES[emotion]||FALLBACK_MOVIES.bored;
      movies = fb.map(m=>({...m,poster_path:null}));
    }

    let botResponse = eData.msg;
    const KEY = process.env.ANTHROPIC_API_KEY;
    if (KEY) {
      try {
        const sys = isChild
          ? `You are Shoufli Movie's friendly chatbot for children. Use simple fun language, 2 sentences max. Detected mood: ${emotion}.`
          : `You are Shoufli Movie's chatbot. Detected mood: ${emotion}. Respond warmly, under 70 words, with emojis.`;
        const r = await fetch('https://api.anthropic.com/v1/messages',{
          method:'POST',
          headers:{'Content-Type':'application/json','x-api-key':KEY,'anthropic-version':'2023-06-01'},
          body:JSON.stringify({model:'claude-haiku-20250514',max_tokens:120,system:sys,messages:[...history.slice(-4),{role:'user',content:message}]}),
        });
        const d = await r.json();
        if (d.content?.[0]?.text) botResponse = d.content[0].text;
      } catch(e){}
    }

    res.json({response:botResponse,emotion,movies,isChildSafe:isChild,recommendedGenres:eData.tmdbIds});
  } catch(e){ res.status(500).json({error:'Chatbot unavailable'}); }
};

module.exports = {chat};
