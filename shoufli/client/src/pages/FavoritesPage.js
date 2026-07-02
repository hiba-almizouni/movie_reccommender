import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoritesAPI, tmdbImage } from '../services/api';
import toast from 'react-hot-toast';

const CERT_COLORS = { 'G':'#22c55e','PG':'#84cc16','PG-13':'#f59e0b','R':'#ef4444' };

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);
  const navigate = useNavigate();

  useEffect(() => { favoritesAPI.getAll().then(({data})=>setFavorites(data.favorites||[])).finally(()=>setLoading(false)); }, []);

  const remove = async id => {
    try { await favoritesAPI.remove(id); setFavorites(f=>f.filter(m=>m.movieId!==id)); toast.success('Removed from My List'); }
    catch { toast.error('Failed to remove'); }
  };

  return (
    <div style={{ minHeight:'100vh',paddingTop:80,padding:'80px 1.5rem 4rem' }} className="page-enter">
      <div style={{ maxWidth:1100,margin:'0 auto' }}>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(2rem,4vw,3rem)',margin:'0 0 .25rem',color:'var(--ct)' }}>❤️ My List</h1>
        <p style={{ color:'var(--cm)',margin:'0 0 2rem',fontSize:'.9rem' }}>{favorites.length} saved movie{favorites.length!==1?'s':''}</p>
        {loading?(
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:'1rem' }}>
            {Array(8).fill(0).map((_,i)=><div key={i} className="skeleton" style={{ height:240,borderRadius:10 }}/>)}
          </div>
        ):favorites.length===0?(
          <div style={{ textAlign:'center',padding:'5rem 2rem' }}>
            <div style={{ fontSize:'4rem',marginBottom:'1rem' }}>🎬</div>
            <h2 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'2rem',color:'var(--ct)',margin:'0 0 .5rem' }}>Your list is empty</h2>
            <p style={{ color:'var(--cm)',marginBottom:'1.5rem' }}>Start adding movies you love!</p>
            <button className="btn-primary" onClick={()=>navigate('/')}>Browse Movies</button>
          </div>
        ):(
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:'1rem' }}>
            {favorites.map(fav => {
              const cert = fav.certification;
              const certColor = CERT_COLORS[cert] || 'rgba(255,255,255,.3)';
              return (
                <div key={fav.movieId} style={{ position:'relative' }}>
                  <div className="movie-card" onClick={()=>navigate(`/movie/${fav.movieId}`)}>
                    <div style={{ position:'relative',paddingTop:'150%',background:'var(--cd3)' }}>
                      {fav.posterPath
                        ? <img src={tmdbImage(fav.posterPath,'w342')} alt={fav.movieTitle} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover' }} onError={e=>e.target.style.display='none'}/>
                        : <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1a0a0f,#0a0a1a)',fontSize:'2.5rem' }}>🎬</div>
                      }
                      {fav.voteAverage>0&&<div style={{ position:'absolute',top:5,right:5,background:'rgba(0,0,0,.85)',borderRadius:5,padding:'2px 5px',fontSize:9,fontWeight:700,color:'#f5c518' }}>★ {fav.voteAverage.toFixed(1)}</div>}
                      {cert&&<div style={{ position:'absolute',top:5,left:5,background:'rgba(0,0,0,.85)',border:`1px solid ${certColor}`,borderRadius:4,padding:'1px 5px',fontSize:8,fontWeight:700,color:certColor }}>{cert}</div>}
                      <div className="movie-card-overlay"><p style={{ color:'white',fontWeight:600,fontSize:'.82rem',margin:0 }}>{fav.movieTitle}</p></div>
                    </div>
                    <div style={{ padding:'7px 8px 9px' }}>
                      <p style={{ margin:0,fontSize:'.78rem',fontWeight:600,color:'var(--ct)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{fav.movieTitle}</p>
                    </div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();remove(fav.movieId);}} style={{ position:'absolute',top:6,left:6,background:'rgba(229,9,20,.85)',border:'none',borderRadius:'50%',width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'white',fontSize:'.7rem',zIndex:5 }} title="Remove">✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default FavoritesPage;
