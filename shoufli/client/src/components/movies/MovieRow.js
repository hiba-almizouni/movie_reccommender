import React, { useRef } from 'react';
import MovieCard from './MovieCard';
import { SkeletonRow } from '../ui/SkeletonCard';

const MovieRow = ({ title, movies=[], loading=false, cardWidth=160, badge }) => {
  const ref = useRef(null);
  const scroll = dir => ref.current?.scrollBy({ left: dir*480, behavior:'smooth' });
  return (
    <section style={{ marginBottom:'2.5rem' }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.75rem',padding:'0 1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <h2 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(1.1rem,2.5vw,1.5rem)',letterSpacing:'.05em',color:'var(--ct)',margin:0 }}>{title}</h2>
          {badge && <span style={{ background:'rgba(229,9,20,.15)',border:'1px solid rgba(229,9,20,.3)',color:'#ff6060',borderRadius:20,padding:'2px 8px',fontSize:'.7rem',fontWeight:700 }}>{badge}</span>}
        </div>
        <div style={{ display:'flex', gap:'.4rem' }}>
          <button className="btn-icon" style={{ width:30,height:30,fontSize:'.85rem' }} onClick={()=>scroll(-1)}>‹</button>
          <button className="btn-icon" style={{ width:30,height:30,fontSize:'.85rem' }} onClick={()=>scroll(1)}>›</button>
        </div>
      </div>
      <div style={{ padding:'0 1rem' }}>
        {loading ? <SkeletonRow count={6}/> : movies.length===0
          ? <p style={{ color:'var(--cm)',fontSize:'.9rem',padding:'1rem 0' }}>No movies found</p>
          : <div ref={ref} className="movie-row-scroll">{movies.map(m=><MovieCard key={m.id} movie={m} width={cardWidth}/>)}</div>
        }
      </div>
    </section>
  );
};

export default MovieRow;
