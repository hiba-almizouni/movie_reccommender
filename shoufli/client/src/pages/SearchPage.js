// ── SearchPage.js ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/movies/MovieCard';
import { SkeletonRow } from '../components/ui/SkeletonCard';

const GENRES = [{id:28,name:'Action'},{id:12,name:'Adventure'},{id:16,name:'Animation'},{id:35,name:'Comedy'},{id:80,name:'Crime'},{id:18,name:'Drama'},{id:10751,name:'Family'},{id:14,name:'Fantasy'},{id:27,name:'Horror'},{id:9648,name:'Mystery'},{id:10749,name:'Romance'},{id:878,name:'Sci-Fi'},{id:53,name:'Thriller'}];
const CHILD_SAFE = [28,12,16,35,18,10751,14];

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentAge, isChild } = useAuth();
  const [query, setQuery]         = useState(searchParams.get('q')||'');
  const [genre, setGenre]         = useState(searchParams.get('genre')?Number(searchParams.get('genre')):null);
  const [minRating, setMinRating] = useState('');
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(false);
  const debounceRef = useRef(null);

  const doSearch = useCallback(async (q, g, r, p=1) => {
    setLoading(true); setSearched(true);
    try {
      const { data } = await moviesAPI.search({ q:q||undefined, genre:g||undefined, minRating:r||undefined, age:currentAge, page:p });
      if (p===1) setResults(data.results||[]);
      else        setResults(prev => [...prev, ...(data.results||[])]);
      setHasMore((data.total_pages||1) > p);
    } catch { setResults([]); } finally { setLoading(false); }
  }, [currentAge]);

  useEffect(() => {
    const q = searchParams.get('q')||'';
    const g = searchParams.get('genre')?Number(searchParams.get('genre')):null;
    setQuery(q); setGenre(g);
    if (q||g) doSearch(q, g, minRating, 1);
  // eslint-disable-next-line
  }, []);

  const handleQueryChange = e => {
    const q = e.target.value; setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); doSearch(q, genre, minRating, 1); }, 450);
  };

  const handleGenre = id => {
    const g = genre===id?null:id; setGenre(g); setPage(1);
    const p = {}; if (query) p.q=query; if (g) p.genre=String(g);
    setSearchParams(p); doSearch(query, g, minRating, 1);
  };

  const visibleGenres = isChild ? GENRES.filter(g=>CHILD_SAFE.includes(g.id)) : GENRES;

  return (
    <div style={{ minHeight:'100vh',paddingTop:80,padding:'80px 1.5rem 4rem' }} className="page-enter">
      <div style={{ maxWidth:1100,margin:'0 auto' }}>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(2rem,4vw,3rem)',margin:'0 0 1.5rem',color:'var(--ct)' }}>🔍 {isChild?'Find Your Movie':'Explore Movies'}</h1>
        <div style={{ display:'flex',gap:'.75rem',marginBottom:'1.25rem',flexWrap:'wrap' }}>
          <div style={{ flex:1,position:'relative',minWidth:220 }}>
            <span style={{ position:'absolute',left:'.85rem',top:'50%',transform:'translateY(-50%)',fontSize:'1rem',color:'var(--cm)',pointerEvents:'none' }}>🔍</span>
            <input type="text" value={query} onChange={handleQueryChange} placeholder={isChild?'Search for a movie...':'Title, genre, keyword...'}
              className="cinema-input" style={{ paddingLeft:'2.5rem' }}/>
          </div>
          {!isChild&&(
            <select value={minRating} onChange={e=>{setMinRating(e.target.value);setPage(1);doSearch(query,genre,e.target.value,1);}}
              className="cinema-input" style={{ width:'auto',padding:'.7rem 1rem',flexShrink:0 }}>
              <option value="">Any Rating</option>
              {['9','8','7','6'].map(r=><option key={r} value={r}>{r}+ ⭐</option>)}
            </select>
          )}
        </div>
        <div style={{ display:'flex',gap:'.4rem',flexWrap:'wrap',marginBottom:'1.75rem' }}>
          <button onClick={()=>handleGenre(null)} style={{ padding:'5px 14px',borderRadius:20,border:'1px solid',cursor:'pointer',background:!genre?'var(--cr)':'var(--cd3)',borderColor:!genre?'var(--cr)':'var(--cb)',color:!genre?'white':'var(--ct)',fontSize:'.8rem',fontWeight:600,transition:'all .15s' }}>All</button>
          {visibleGenres.map(g=>{const active=genre===g.id;return(
            <button key={g.id} onClick={()=>handleGenre(g.id)} style={{ padding:'5px 12px',borderRadius:20,border:'1px solid',cursor:'pointer',background:active?'var(--cr)':'var(--cd3)',borderColor:active?'var(--cr)':'var(--cb)',color:active?'white':'var(--ct)',fontSize:'.8rem',transition:'all .15s' }}>{g.name}</button>
          );})}
        </div>
        {!searched&&!loading?(
          <div style={{ textAlign:'center',padding:'5rem 2rem' }}>
            <div style={{ fontSize:'3.5rem',marginBottom:'1rem',opacity:.5 }}>🎬</div>
            <h3 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'1.8rem',color:'var(--ct)',margin:'0 0 .5rem' }}>Discover Your Next Favourite</h3>
            <p style={{ color:'var(--cm)',fontSize:'.9rem' }}>Type a title above or tap a genre</p>
          </div>
        ):(
          <>
            {loading&&page===1?<SkeletonRow count={12}/>:(
              results.length===0?<p style={{ color:'var(--cm)',fontSize:'.9rem' }}>No movies found. Try different keywords.</p>:(
                <>
                  <p style={{ color:'var(--cm)',fontSize:'.82rem',marginBottom:'1rem' }}>{results.length} result{results.length!==1?'s':''}</p>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(148px,1fr))',gap:'1rem' }}>
                    {results.map(m=><MovieCard key={m.id} movie={m}/>)}
                  </div>
                  {hasMore&&!loading&&<div style={{ textAlign:'center',marginTop:'2rem' }}><button className="btn-ghost" onClick={()=>{const next=page+1;setPage(next);doSearch(query,genre,minRating,next);}}>Load More ↓</button></div>}
                </>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
