const fetch = require('node-fetch');
const TMDB_BASE = 'https://api.themoviedb.org/3';

const inferCert = (m) => {
  const g = m.genre_ids||[];
  if (m.adult) return 'NC-17';
  if (g.includes(27)||g.includes(53)) return 'R';
  if (g.includes(10749)||g.includes(80)) return 'PG-13';
  if (g.includes(16)||g.includes(10751)) return 'G';
  if (g.includes(28)||g.includes(12)) return 'PG-13';
  return 'PG';
};

const getAgeRestrictions = (age) => {
  if (age<=6)  return {allowedGenres:[16,10751],blockedGenres:[27,53,10749,80],maxAdult:false};
  if (age<=12) return {allowedGenres:[16,10751,35,12,14],blockedGenres:[27,53,80],maxAdult:false};
  if (age<=16) return {allowedGenres:null,blockedGenres:[27],maxAdult:false};
  return {allowedGenres:null,blockedGenres:[],maxAdult:true};
};

const MOCK_MOVIES = [
  {id:1,title:'Dragon Kingdom',overview:'A young warrior discovers their destiny.',poster_path:null,vote_average:8.5,genre_ids:[16,10751,14],release_date:'2023-03-10',runtime:98,certification:'G'},
  {id:2,title:'The Grand Adventure',overview:'A thrilling journey across magical lands.',poster_path:null,vote_average:8.2,genre_ids:[12,14,35],release_date:'2023-06-15',runtime:120,certification:'PG'},
  {id:3,title:'Laughing All the Way',overview:'A comedy about family road trip chaos.',poster_path:null,vote_average:7.9,genre_ids:[35,10751],release_date:'2023-12-22',runtime:90,certification:'G'},
  {id:4,title:'Starlight Chronicles',overview:'An epic space opera spanning galaxies.',poster_path:null,vote_average:7.8,genre_ids:[878,12],release_date:'2023-09-20',runtime:135,certification:'PG-13'},
  {id:5,title:'Meadowbrook Magic',overview:'Animated woodland creatures save their home.',poster_path:null,vote_average:8.7,genre_ids:[16,10751],release_date:'2023-04-07',runtime:88,certification:'G'},
  {id:6,title:'Ironclad Warriors',overview:'Elite soldiers defend humanity.',poster_path:null,vote_average:7.3,genre_ids:[28,878],release_date:'2023-08-11',runtime:150,certification:'PG-13'},
  {id:7,title:'When Stars Align',overview:'A love story across timelines.',poster_path:null,vote_average:7.6,genre_ids:[10749,18],release_date:'2023-02-14',runtime:118,certification:'PG-13'},
  {id:8,title:'Mystery of the Deep',overview:'A marine biologist uncovers secrets.',poster_path:null,vote_average:7.1,genre_ids:[9648,12],release_date:'2023-11-01',runtime:115,certification:'PG'},
  {id:9,title:'Pulse of the City',overview:'A detective drama in a neon-lit city.',poster_path:null,vote_average:8.0,genre_ids:[80,878,53],release_date:'2023-05-15',runtime:140,certification:'R'},
  {id:10,title:'The Last Summer',overview:'Friends share their final summer.',poster_path:null,vote_average:7.5,genre_ids:[35,10749],release_date:'2023-07-04',runtime:105,certification:'PG-13'},
];

const tmdbFetch = async (ep,params={}) => {
  const key = process.env.TMDB_API_KEY; if (!key) return null;
  const url = new URL(`${TMDB_BASE}${ep}`);
  url.searchParams.set('api_key',key);
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,String(v)));
  const r = await fetch(url.toString()); if (!r.ok) return null;
  return r.json();
};

const attachCert = (m) => ({ ...m, certification: m.certification||inferCert(m) });

const ageFilter = (arr, age) => {
  const r = getAgeRestrictions(age);
  let res = arr;
  if (!r.maxAdult) res = res.filter(m=>!m.adult);
  if (r.blockedGenres.length) res = res.filter(m=>!(m.genre_ids||[]).some(g=>r.blockedGenres.includes(g)));
  if (r.allowedGenres) res = res.filter(m=>(m.genre_ids||[]).some(g=>r.allowedGenres.includes(g)));
  return res;
};

const getMovies = async (req,res) => {
  const {category='trending',page=1,age} = req.query;
  const userAge = age?parseInt(age):req.user?.age||18;
  try {
    const eps = {trending:'/trending/movie/week',top_rated:'/movie/top_rated',upcoming:'/movie/upcoming',popular:'/movie/popular'};
    const data = await tmdbFetch(eps[category]||eps.trending,{page,language:'en-US'});
    if (!data) return res.json({results:ageFilter(MOCK_MOVIES,userAge).map(attachCert),total_pages:1,page:1,mock:true});
    res.json({...data,results:ageFilter(data.results||[],userAge).map(attachCert)});
  } catch(e){ res.json({results:MOCK_MOVIES.map(attachCert),total_pages:1,page:1,mock:true}); }
};

const getMovieById = async (req,res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}`,{append_to_response:'videos,credits,similar,release_dates'});
    if (!data) {
      const mock = MOCK_MOVIES.find(m=>m.id===parseInt(req.params.id));
      if (!mock) return res.status(404).json({error:'Movie not found'});
      return res.json(attachCert(mock));
    }
    const usCert = data.release_dates?.results?.find(r=>r.iso_3166_1==='US')?.release_dates?.[0]?.certification;
    res.json(attachCert({...data,certification:usCert||inferCert(data)}));
  } catch(e){ res.status(500).json({error:'Failed to fetch movie'}); }
};

const searchMovies = async (req,res) => {
  const {q,genre,minRating,age,page=1} = req.query;
  const userAge = age?parseInt(age):18;
  try {
    let results = [];
    const data = q&&process.env.TMDB_API_KEY ? await tmdbFetch('/search/movie',{query:q,page,language:'en-US'}) : null;
    results = data?.results||MOCK_MOVIES.filter(m=>q?m.title.toLowerCase().includes(q.toLowerCase()):true);
    if (minRating) results = results.filter(m=>m.vote_average>=parseFloat(minRating));
    if (genre) results = results.filter(m=>(m.genre_ids||[]).includes(parseInt(genre)));
    results = ageFilter(results,userAge).map(attachCert);
    res.json({results,total_results:results.length});
  } catch(e){ res.status(500).json({error:'Search failed'}); }
};

const getGenres = async (req,res) => {
  const data = await tmdbFetch('/genre/movie/list',{language:'en-US'});
  if (data) return res.json(data);
  res.json({genres:[{id:28,name:'Action'},{id:12,name:'Adventure'},{id:16,name:'Animation'},{id:35,name:'Comedy'},{id:80,name:'Crime'},{id:18,name:'Drama'},{id:10751,name:'Family'},{id:14,name:'Fantasy'},{id:27,name:'Horror'},{id:9648,name:'Mystery'},{id:10749,name:'Romance'},{id:878,name:'Science Fiction'},{id:53,name:'Thriller'},{id:99,name:'Documentary'}]});
};

module.exports = {getMovies,getMovieById,searchMovies,getGenres,MOCK_MOVIES,getAgeRestrictions,attachCert,ageFilter};
