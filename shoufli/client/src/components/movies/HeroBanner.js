import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbBackdrop, tmdbImage } from '../../services/api';

const CERT_COLORS = { 'G':'#22c55e','PG':'#84cc16','PG-13':'#f59e0b','R':'#ef4444' };

const HeroBanner = ({ movies=[] }) => {
  const [cur, setCur] = useState(0);
  const navigate = useNavigate();
  const featured = movies.slice(0,5);

  useEffect(() => {
    if (featured.length<=1) return;
    const t = setInterval(() => setCur(c=>(c+1)%featured.length), 7000);
    return () => clearInterval(t);
  }, [featured.length]);

  if (!featured.length) return null;
  const movie = featured[cur];
  const cert  = movie.certification;

  return (
    <div style={{ position:'relative',width:'100%',height:'clamp(420px,70vh,720px)',overflow:'hidden',marginBottom:'2rem' }}>
      {featured.map((m,i) => {
        const bg = tmdbBackdrop(m.backdrop_path) || tmdbImage(m.poster_path,'original');
        return (
          <div key={m.id} style={{ position:'absolute',inset:0,backgroundImage:bg?`url(${bg})`:'none',backgroundColor:'#1a0a0f',backgroundSize:'cover',backgroundPosition:'center top',opacity:i===cur?1:0,transition:'opacity 1.2s ease',zIndex:i===cur?1:0 }}/>
        );
      })}
      <div style={{ position:'absolute',inset:0,zIndex:2,background:'linear-gradient(to right,rgba(0,0,0,.92) 0%,rgba(0,0,0,.65) 45%,rgba(0,0,0,.15) 80%,transparent 100%)' }}/>
      <div style={{ position:'absolute',bottom:0,left:0,right:0,height:'40%',zIndex:2,background:'linear-gradient(to top,var(--cd) 0%,transparent 100%)' }}/>
      <div style={{ position:'absolute',bottom:'10%',left:0,right:0,zIndex:3,padding:'0 clamp(1.5rem,5vw,5rem)',maxWidth:650 }}>
        <div style={{ marginBottom:'.75rem',display:'flex',alignItems:'center',gap:'0.5rem' }}>
          <span className="badge">🔥 Featured</span>
          {cert && <span style={{ background:'rgba(0,0,0,.7)',border:`1px solid ${CERT_COLORS[cert]||'rgba(255,255,255,.3)'}`,color:CERT_COLORS[cert]||'rgba(255,255,255,.5)',borderRadius:6,padding:'2px 8px',fontSize:'.75rem',fontWeight:700 }}>{cert}</span>}
        </div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(2.2rem,6vw,4.5rem)',lineHeight:1.0,color:'white',margin:'0 0 .75rem',textShadow:'0 2px 20px rgba(0,0,0,.8)' }}>{movie.title}</h1>
        <div style={{ display:'flex',alignItems:'center',gap:'1rem',marginBottom:'.75rem',flexWrap:'wrap' }}>
          {movie.vote_average>0 && <span style={{ color:'#f5c518',fontWeight:700,fontSize:'.95rem' }}>★ {movie.vote_average.toFixed(1)}</span>}
          {movie.release_date && <span style={{ color:'rgba(255,255,255,.6)',fontSize:'.85rem' }}>{movie.release_date.slice(0,4)}</span>}
        </div>
        {movie.overview && <p style={{ color:'rgba(255,255,255,.75)',fontSize:'clamp(.85rem,1.5vw,1rem)',lineHeight:1.6,margin:'0 0 1.5rem',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{movie.overview}</p>}
        <div style={{ display:'flex',gap:'.75rem',flexWrap:'wrap' }}>
          <button className="btn-primary" style={{ fontSize:'1rem',padding:'.75rem 2rem' }} onClick={()=>navigate(`/movie/${movie.id}`)}>▶ Watch Now</button>
          <button className="btn-ghost" style={{ fontSize:'1rem',padding:'.75rem 1.5rem' }} onClick={()=>navigate(`/movie/${movie.id}`)}>ℹ More Info</button>
        </div>
      </div>
      {featured.length>1 && (
        <div style={{ position:'absolute',bottom:'2rem',right:'2rem',zIndex:3,display:'flex',gap:6 }}>
          {featured.map((_,i)=><button key={i} onClick={()=>setCur(i)} style={{ width:i===cur?24:8,height:8,borderRadius:4,border:'none',cursor:'pointer',background:i===cur?'var(--cr)':'rgba(255,255,255,.35)',transition:'all .3s',padding:0 }}/>)}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
