import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '../components/movies/HeroBanner';
import MovieRow from '../components/movies/MovieRow';
import ChildModeInterface from '../components/parental/ChildModeInterface';
import { moviesAPI, recommendationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { currentAge, isChild, user } = useAuth();
  const navigate = useNavigate();
  const [trending, setTrending]       = useState([]);
  const [topRated, setTopRated]       = useState([]);
  const [upcoming, setUpcoming]       = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [personalised, setPersonalised] = useState(false);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const [t, tr, u] = await Promise.all([
          moviesAPI.getMovies({ category:'trending', age:currentAge }),
          moviesAPI.getMovies({ category:'top_rated', age:currentAge }),
          moviesAPI.getMovies({ category:'upcoming',  age:currentAge }),
        ]);
        if (cancelled) return;
        setTrending(t.data.results  || []);
        setTopRated(tr.data.results || []);
        setUpcoming(u.data.results  || []);

        // Smart recommendations (uses watch history + favorites)
        if (user) {
          const rec = await recommendationsAPI.get({ age:currentAge });
          if (!cancelled) {
            setRecommended(rec.data.results   || []);
            setPersonalised(rec.data.personalised || false);
          }
        }
      } catch (e) {
        console.error('Home fetch error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [currentAge, user]);

  if (isChild) {
    return (
      <div className="child-mode page-enter" style={{ minHeight:'100vh',paddingTop:64 }}>
        <ChildModeInterface movies={trending} onMoodSelect={() => {}}/>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ minHeight:'100vh',paddingTop:64 }}>
      {/* Hero */}
      {loading
        ? <div className="skeleton" style={{ height:'clamp(420px,70vh,720px)',borderRadius:0,marginBottom:'2rem' }}/>
        : <HeroBanner movies={trending}/>
      }

      <div style={{ maxWidth:'100%',padding:'0 .5rem' }}>

        {/* Smart recommendations */}
        {user && recommended.length>0 && (
          <MovieRow
            title={personalised ? '✨ Recommended For You' : '✨ You Might Like'}
            badge={personalised ? 'Personalised' : null}
            movies={recommended}
            loading={loading}
          />
        )}

        <MovieRow title="🔥 Trending This Week" movies={trending}  loading={loading}/>
        <MovieRow title="🏆 Top Rated"          movies={topRated}  loading={loading}/>
        <MovieRow title="🎬 Coming Soon"        movies={upcoming}  loading={loading}/>
      </div>

      {/* Shoufli AI promo banner */}
      <div style={{ maxWidth:1100,margin:'0 auto 3rem',padding:'0 1.5rem' }}>
        <div onClick={() => navigate('/ai-picks')} style={{ background:'linear-gradient(135deg,rgba(229,9,20,.1) 0%,rgba(124,58,237,.1) 100%)',border:'1px solid rgba(229,9,20,.2)',borderRadius:16,padding:'1.5rem 2rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem',transition:'border-color .2s,box-shadow .2s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(229,9,20,.5)';e.currentTarget.style.boxShadow='0 8px 32px rgba(229,9,20,.15)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(229,9,20,.2)';e.currentTarget.style.boxShadow='none';}}>
          <div style={{ display:'flex',alignItems:'center',gap:'1.25rem' }}>
            <div style={{ width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#e50914,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',flexShrink:0 }}>🤖</div>
            <div>
              <p style={{ margin:'0 0 3px',fontWeight:700,fontSize:'1.05rem',color:'var(--ct)' }}>Try Shoufli AI</p>
              <p style={{ margin:0,fontSize:'.85rem',color:'var(--cm)' }}>Tell us your mood — our AI picks the perfect films for you</p>
            </div>
          </div>
          <button className="btn-primary" style={{ flexShrink:0 }}>✨ Get AI Picks →</button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign:'center',padding:'2rem 1rem',color:'var(--cm)',fontSize:'.78rem',borderTop:'1px solid var(--cb)' }}>
        <p style={{ margin:0 }}>🎬 Shoufli Movie · Movie data by <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" style={{ color:'var(--cr)',textDecoration:'none' }}>TMDb</a></p>
      </div>
    </div>
  );
};

export default HomePage;
