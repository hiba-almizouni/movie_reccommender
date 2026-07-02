const router = require('express').Router();
const fetch  = require('node-fetch');
const { optionalAuth } = require('../middleware/auth');

const FALLBACK = {
  happy:   [{id:862,title:'Toy Story',emoji:'🤠',color:'#1a1a3a',cert:'G',rating:8.3},{id:13,title:'Forrest Gump',emoji:'🏃',color:'#1a3a1a',cert:'PG-13',rating:8.8},{id:14160,title:'Up',emoji:'🏠',color:'#1a3a3a',cert:'PG',rating:8.3},{id:354912,title:'Coco',emoji:'🎸',color:'#2a0a1a',cert:'PG',rating:8.4}],
  sad:     [{id:637,title:'Life is Beautiful',emoji:'🌹',color:'#2a1a0a',cert:'PG-13',rating:8.6},{id:278,title:'The Shawshank Redemption',emoji:'🔓',color:'#2a1a0a',cert:'R',rating:9.3},{id:77338,title:'The Intouchables',emoji:'🤝',color:'#0a1a2a',cert:'R',rating:8.5},{id:10681,title:'WALL·E',emoji:'🤖',color:'#1a2a3a',cert:'G',rating:8.4}],
  excited: [{id:24428,title:'The Avengers',emoji:'🛡️',color:'#1a0a0a',cert:'PG-13',rating:8.0},{id:157336,title:'Interstellar',emoji:'🚀',color:'#0a1a2a',cert:'PG-13',rating:8.7},{id:155,title:'The Dark Knight',emoji:'🦇',color:'#0a0a1a',cert:'PG-13',rating:9.0},{id:19995,title:'Avatar',emoji:'🌿',color:'#0a2a1a',cert:'PG-13',rating:7.9}],
  relaxed: [{id:637,title:'Life is Beautiful',emoji:'🌹',color:'#2a1a0a',cert:'PG-13',rating:8.6},{id:129,title:'Spirited Away',emoji:'🌸',color:'#2a1a2a',cert:'PG',rating:8.6},{id:10681,title:'WALL·E',emoji:'🤖',color:'#1a2a3a',cert:'G',rating:8.4},{id:77338,title:'The Intouchables',emoji:'🤝',color:'#0a1a2a',cert:'R',rating:8.5}],
  bored:   [{id:603,title:'The Matrix',emoji:'💊',color:'#0a2a0a',cert:'R',rating:8.7},{id:155,title:'The Dark Knight',emoji:'🦇',color:'#0a0a1a',cert:'PG-13',rating:9.0},{id:157336,title:'Interstellar',emoji:'🚀',color:'#0a1a2a',cert:'PG-13',rating:8.7},{id:550,title:'Fight Club',emoji:'👊',color:'#1a0a0a',cert:'R',rating:8.8}],
  romantic:[{id:637,title:'Life is Beautiful',emoji:'🌹',color:'#2a1a0a',cert:'PG-13',rating:8.6},{id:13,title:'Forrest Gump',emoji:'🏃',color:'#1a3a1a',cert:'PG-13',rating:8.8},{id:77338,title:'The Intouchables',emoji:'🤝',color:'#0a1a2a',cert:'R',rating:8.5}],
  scared:  [{id:862,title:'Toy Story',emoji:'🤠',color:'#1a1a3a',cert:'G',rating:8.3},{id:10681,title:'WALL·E',emoji:'🤖',color:'#1a2a3a',cert:'G',rating:8.4},{id:129,title:'Spirited Away',emoji:'🌸',color:'#2a1a2a',cert:'PG',rating:8.6}],
  angry:   [{id:24428,title:'The Avengers',emoji:'🛡️',color:'#1a0a0a',cert:'PG-13',rating:8.0},{id:155,title:'The Dark Knight',emoji:'🦇',color:'#0a0a1a',cert:'PG-13',rating:9.0},{id:603,title:'The Matrix',emoji:'💊',color:'#0a2a0a',cert:'R',rating:8.7}],
};

const GENRE_IDS = {
  happy:[35,16,10751],sad:[35,18,16],excited:[28,12,878],
  relaxed:[10749,18,99],bored:[53,28,878],romantic:[10749,18,35],
  scared:[35,16,12],angry:[28,12,53],
};

router.post('/', optionalAuth, async (req, res) => {
  const { mood='bored', freeText='', lang='en', favoriteTitles='' } = req.body;
  try {
    let movies = [];
    let message = '';

    // Try TMDb discover
    const TMDB = process.env.TMDB_API_KEY;
    if (TMDB) {
      const ids = (GENRE_IDS[mood] || GENRE_IDS.bored).slice(0,2).join(',');
      const r = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB}&with_genres=${ids}&sort_by=vote_average.desc&vote_count.gte=200&page=1`);
      const d = await r.json();
      if (d.results?.length >= 3) {
        movies = d.results.slice(0,8).map(m => ({
          id: m.id, title: m.title, poster_path: m.poster_path,
          vote_average: m.vote_average, year: m.release_date?.slice(0,4),
        }));
      }
    }

    // Fallback to hardcoded list
    if (!movies.length) {
      movies = (FALLBACK[mood] || FALLBACK.bored).map(m => ({ ...m, poster_path: null }));
    }

    // Try Anthropic for personalised message
    const AK = process.env.ANTHROPIC_API_KEY;
    if (AK) {
      try {
        const langName = lang==='tn' ? 'Tunisian Darija Arabic' : lang==='fr' ? 'French' : 'English';
        const prompt = `You are Shoufli Movie AI. User mood: ${mood}. User said: "${freeText||'nothing'}". Saved films: ${favoriteTitles||'none'}. Write a warm personalised 1-2 sentence recommendation intro in ${langName}. Max 60 words. Include emoji.`;
        const ar = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'x-api-key':AK, 'anthropic-version':'2023-06-01' },
          body: JSON.stringify({ model:'claude-haiku-20250514', max_tokens:100, messages:[{ role:'user', content:prompt }] }),
        });
        const ad = await ar.json();
        if (ad.content?.[0]?.text) message = ad.content[0].text.trim();
      } catch(e) {}
    }

    if (!message) {
      const msgs = { en:'🎬 Here are your personalised picks!', fr:'🎬 Voici vos sélections personnalisées !', tn:'🎬 هاذم اختياراتك الشخصية!' };
      message = msgs[lang] || msgs.en;
    }

    res.json({ movies, message });
  } catch(e) {
    res.json({ movies: (FALLBACK[mood]||FALLBACK.bored).map(m=>({...m,poster_path:null})), message:'🎬 Great picks for your mood!' });
  }
});

module.exports = router;
