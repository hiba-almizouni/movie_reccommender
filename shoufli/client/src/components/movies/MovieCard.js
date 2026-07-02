import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbImage } from '../../services/api';

const CERT_COLORS = {
  'G':'#22c55e','TV-G':'#22c55e','TV-Y':'#22c55e','TV-Y7':'#22c55e',
  'PG':'#84cc16','TV-PG':'#84cc16',
  'PG-13':'#f59e0b','TV-14':'#f97316',
  'R':'#ef4444','TV-MA':'#ef4444','NC-17':'#dc2626',
};

const MovieCard = ({ movie, width=160 }) => {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const rating = movie.vote_average ? parseFloat(movie.vote_average).toFixed(1) : '?';
  const year   = movie.release_date ? movie.release_date.slice(0,4) : '';
  const height = Math.round(width * 1.5);
  const cert   = movie.certification;
  const certColor = CERT_COLORS[cert] || 'rgba(255,255,255,.3)';
  const hasPoster = !!movie.poster_path && !failed;

  return (
    <div className="movie-card" style={{ width, flexShrink:0 }} onClick={() => navigate(`/movie/${movie.id}`)}>
      <div style={{ position:'relative', width, height, background:'var(--cd3)', overflow:'hidden' }}>
        {hasPoster
          ? <img src={tmdbImage(movie.poster_path,'w342')} alt={movie.title} loading="lazy"
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
              onError={() => setFailed(true)}/>
          : <div style={{ width:'100%',height:'100%',background:'linear-gradient(135deg,#1a0a0f,#0a0a1a)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6 }}>
              <span style={{ fontSize:Math.max(width*.22,22) }}>🎬</span>
              <span style={{ fontSize:8,color:'rgba(255,255,255,.35)',padding:'0 6px',textAlign:'center',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>{movie.title}</span>
            </div>
        }
        {/* Rating */}
        <div style={{ position:'absolute',top:5,right:5,background:'rgba(0,0,0,.85)',borderRadius:5,padding:'2px 5px',fontSize:9,fontWeight:700,color:parseFloat(rating)>=7?'#f5c518':'#a0a0b0',border:'.5px solid rgba(255,255,255,.12)',zIndex:2 }}>★ {rating}</div>
        {/* Cert badge */}
        {cert && <div style={{ position:'absolute',top:5,left:5,background:'rgba(0,0,0,.85)',border:`1px solid ${certColor}`,borderRadius:4,padding:'1px 5px',fontSize:8,fontWeight:700,color:certColor,zIndex:2 }}>{cert}</div>}
        {/* Hover overlay */}
        <div className="movie-card-overlay">
          <p style={{ color:'white',fontWeight:600,fontSize:'.82rem',margin:0,lineHeight:1.3 }}>{movie.title}</p>
          {year && <p style={{ color:'rgba(255,255,255,.55)',fontSize:'.7rem',margin:'2px 0 0' }}>{year}</p>}
          <span style={{ marginTop:6,background:'var(--cr)',color:'white',borderRadius:4,padding:'2px 8px',fontSize:'.68rem',fontWeight:600,display:'inline-block' }}>▶ View</span>
        </div>
      </div>
      <div style={{ padding:'7px 8px 9px' }}>
        <p style={{ margin:0,fontSize:'.78rem',fontWeight:600,color:'var(--ct)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{movie.title}</p>
        <p style={{ margin:'2px 0 0',fontSize:'.7rem',color:'var(--cm)' }}>{year}</p>
      </div>
    </div>
  );
};

export default MovieCard;
