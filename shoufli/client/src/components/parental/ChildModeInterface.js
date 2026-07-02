import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbImage } from '../../services/api';
import { useLang } from '../../context/LangContext';

const MOODS = [
  { emoji:'😊', en:'Happy',   fr:'Joyeux',  tn:'فرحان',  color:'#f59e0b', query:'I feel happy'   },
  { emoji:'😢', en:'Sad',     fr:'Triste',  tn:'حزين',   color:'#3b82f6', query:'I feel sad'     },
  { emoji:'🤩', en:'Excited', fr:'Excité',  tn:'متحمس',  color:'#ec4899', query:'I am excited'   },
  { emoji:'😑', en:'Bored',   fr:'Ennuyé',  tn:'معيان',  color:'#6b7280', query:'I am bored'     },
  { emoji:'😂', en:'Silly',   fr:'Rigolo',  tn:'نضحك',   color:'#10b981', query:'I want funny'   },
  { emoji:'😌', en:'Calm',    fr:'Calme',   tn:'هادئ',   color:'#8b5cf6', query:'I am relaxed'   },
];

const SAFE_MOVIES = [
  { id:862,   title:'Toy Story',          emoji:'🤠', color:'#1a1a3a', cert:'G'  },
  { id:10681, title:'WALL·E',             emoji:'🤖', color:'#1a2a3a', cert:'G'  },
  { id:14160, title:'Up',                 emoji:'🏠', color:'#1a3a3a', cert:'PG' },
  { id:129,   title:'Spirited Away',      emoji:'🌸', color:'#2a1a2a', cert:'PG' },
  { id:354912,title:'Coco',               emoji:'🎸', color:'#2a0a1a', cert:'PG' },
  { id:420818,title:'The Lion King',      emoji:'🦁', color:'#2a1a00', cert:'PG' },
  { id:508439,title:'Onward',             emoji:'🧙', color:'#1a0a2a', cert:'PG' },
  { id:812567,title:'Luca',               emoji:'🌊', color:'#0a1a2a', cert:'PG' },
];

const CERT_COLORS = { 'G':'#22c55e','PG':'#84cc16' };

const ChildModeInterface = ({ movies=[], onMoodSelect }) => {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  const moodLabel = m => lang==='fr'?m.fr:lang==='tn'?m.tn:m.en;
  const displayMovies = movies.length>0 ? movies.slice(0,12) : SAFE_MOVIES;

  const tx = {
    en:{ title:"What do you want to watch? 🎬", sub:"Pick your mood and I'll find the perfect movie!", moodQ:"How do you feel right now?", movies:"🍿 Movies Just For You!" },
    fr:{ title:"Que veux-tu regarder ? 🎬", sub:"Choisis ton humeur !", moodQ:"Comment tu te sens ?", movies:"🍿 Films Pour Toi !" },
    tn:{ title:"شنوا تحب تشوف؟ 🎬", sub:"اختار مزاجك ونلقالك فيلم!", moodQ:"كيفاش تحس روحك؟", movies:"🍿 أفلام آمنة ليك!" },
  }[lang] || { title:"What do you want to watch? 🎬", sub:"Pick your mood!", moodQ:"How do you feel?", movies:"🍿 Movies For You!" };

  return (
    <div style={{ padding:'1.5rem 1rem 4rem',minHeight:'80vh',background:'linear-gradient(180deg,#0a1628 0%,#0a0a1a 100%)' }}>
      {/* Header */}
      <div style={{ textAlign:'center',padding:'1.5rem 0 1.5rem',maxWidth:480,margin:'0 auto' }}>
        <div style={{ fontSize:'3rem',marginBottom:'.75rem',animation:'float 3s ease-in-out infinite' }}>🌟</div>
        <h1 style={{ fontFamily:'DM Sans,sans-serif',fontWeight:800,fontSize:'clamp(1.4rem,4vw,2rem)',color:'#e8f0ff',margin:'0 0 .5rem' }}>{tx.title}</h1>
        <p style={{ color:'rgba(200,220,255,.5)',fontSize:'.875rem',margin:0 }}>{tx.sub}</p>
      </div>

      {/* Mood grid */}
      <div style={{ maxWidth:400,margin:'0 auto 2rem' }}>
        <p style={{ textAlign:'center',fontSize:'.82rem',fontWeight:600,color:'rgba(200,220,255,.45)',marginBottom:'.75rem',textTransform:'uppercase',letterSpacing:'.08em' }}>{tx.moodQ}</p>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'.6rem' }}>
          {MOODS.map(mood => (
            <button key={mood.emoji} onClick={() => { setActive(mood.emoji); onMoodSelect?.(mood.query); window.dispatchEvent(new CustomEvent('shoufli:chatbot:open',{detail:{message:mood.query}})); }}
              style={{ background:active===mood.emoji?`${mood.color}33`:'rgba(255,255,255,.05)',border:`2px solid ${active===mood.emoji?mood.color:'rgba(255,255,255,.1)'}`,borderRadius:14,padding:'.875rem .5rem',cursor:'pointer',transition:'all .2s',display:'flex',flexDirection:'column',alignItems:'center',gap:5,transform:active===mood.emoji?'scale(1.06)':'scale(1)' }}>
              <span style={{ fontSize:'1.75rem',lineHeight:1 }}>{mood.emoji}</span>
              <span style={{ fontSize:'.78rem',fontWeight:700,color:'#e8f0ff' }}>{moodLabel(mood)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Movie grid */}
      <div style={{ maxWidth:680,margin:'0 auto' }}>
        <p style={{ textAlign:'center',fontSize:'.95rem',fontWeight:700,color:'#e8f0ff',marginBottom:'.875rem' }}>{tx.movies}</p>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(105px,1fr))',gap:'.75rem' }}>
          {displayMovies.map((movie,idx) => {
            const safe = SAFE_MOVIES[idx % SAFE_MOVIES.length];
            const cert = movie.certification || safe?.cert;
            return (
              <div key={movie.id||idx} onClick={() => navigate(`/movie/${movie.id||safe.id}`)}
                style={{ borderRadius:12,overflow:'hidden',cursor:'pointer',border:'2px solid rgba(108,99,255,.2)',transition:'all .2s',background:'#1a2a4a' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.06)';e.currentTarget.style.borderColor='rgba(108,99,255,.6)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.borderColor='rgba(108,99,255,.2)';}}>
                <div style={{ position:'relative',paddingTop:'150%',background:'#0a1628' }}>
                  {movie.poster_path
                    ? <img src={tmdbImage(movie.poster_path,'w185')} alt={movie.title} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover' }} onError={e=>e.target.style.display='none'}/>
                    : <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:`linear-gradient(135deg,${safe?.color||'#1a2a4a'},#0a0a2a)`,fontSize:'2.5rem' }}>{safe?.emoji||'🎬'}</div>
                  }
                  {cert && <div style={{ position:'absolute',top:4,left:4,background:'rgba(0,0,0,.85)',border:`1px solid ${CERT_COLORS[cert]||'#f59e0b'}`,borderRadius:4,padding:'1px 5px',fontSize:8,fontWeight:700,color:CERT_COLORS[cert]||'#f59e0b' }}>{cert}</div>}
                </div>
                <div style={{ padding:'6px 7px 8px',background:'rgba(0,0,0,.3)' }}>
                  <p style={{ margin:0,fontSize:'.75rem',fontWeight:700,color:'#c8d8ff',lineHeight:1.3,overflow:'hidden',textOverflow:'ellipsis',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>{movie.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  );
};

export default ChildModeInterface;
