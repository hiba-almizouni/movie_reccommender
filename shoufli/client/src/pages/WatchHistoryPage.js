import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyAPI, tmdbImage } from '../services/api';

const WatchHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { historyAPI.getAll().then(({data})=>setHistory(data.history||[])).finally(()=>setLoading(false)); }, []);

  const grouped = history.reduce((acc, item) => {
    const date = new Date(item.watchedAt).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    if (!acc[date]) acc[date]=[];
    acc[date].push(item); return acc;
  }, {});

  return (
    <div style={{ minHeight:'100vh',paddingTop:80,padding:'80px 1.5rem 4rem' }} className="page-enter">
      <div style={{ maxWidth:1100,margin:'0 auto' }}>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(2rem,4vw,3rem)',margin:'0 0 .25rem',color:'var(--ct)' }}>🕐 Watch History</h1>
        <p style={{ color:'var(--cm)',margin:'0 0 2rem',fontSize:'.9rem' }}>Movies you've recently viewed</p>
        {loading?(
          <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
            {Array(5).fill(0).map((_,i)=><div key={i} className="skeleton" style={{ height:80,borderRadius:10 }}/>)}
          </div>
        ):history.length===0?(
          <div style={{ textAlign:'center',padding:'5rem 2rem' }}>
            <div style={{ fontSize:'4rem',marginBottom:'1rem' }}>🎬</div>
            <h2 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'2rem',color:'var(--ct)',margin:'0 0 .5rem' }}>No history yet</h2>
            <p style={{ color:'var(--cm)',marginBottom:'1.5rem' }}>Start watching movies to build your history!</p>
            <button className="btn-primary" onClick={()=>navigate('/')}>Browse Movies</button>
          </div>
        ):(
          <div style={{ display:'flex',flexDirection:'column',gap:'2rem' }}>
            {Object.entries(grouped).map(([date,items])=>(
              <div key={date}>
                <h3 style={{ fontFamily:'DM Sans,sans-serif',fontWeight:600,fontSize:'.82rem',color:'var(--cm)',margin:'0 0 .75rem',textTransform:'uppercase',letterSpacing:'.08em' }}>{date}</h3>
                <div style={{ display:'flex',flexDirection:'column',gap:'.5rem' }}>
                  {items.map((item,i)=>(
                    <div key={i} className="cinema-card" onClick={()=>navigate(`/movie/${item.movieId}`)}
                      style={{ display:'flex',alignItems:'center',gap:'1rem',padding:'.75rem 1rem',cursor:'pointer' }}>
                      {item.posterPath
                        ? <img src={tmdbImage(item.posterPath,'w92')} alt={item.movieTitle} style={{ width:48,height:72,objectFit:'cover',borderRadius:6,flexShrink:0 }} onError={e=>e.target.style.display='none'}/>
                        : <div style={{ width:48,height:72,background:'linear-gradient(135deg,#1a0a0f,#0a0a1a)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',flexShrink:0 }}>🎬</div>
                      }
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0,fontWeight:600,fontSize:'.95rem',color:'var(--ct)' }}>{item.movieTitle}</p>
                        {item.genres?.length>0&&<p style={{ margin:'2px 0 0',fontSize:'.78rem',color:'var(--cm)' }}>{item.genres.slice(0,3).join(' · ')}</p>}
                      </div>
                      <span style={{ fontSize:'.75rem',color:'var(--cm)',flexShrink:0 }}>{new Date(item.watchedAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default WatchHistoryPage;
