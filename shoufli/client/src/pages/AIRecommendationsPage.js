import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { tmdbImage, favoritesAPI } from '../services/api';

const CERT_COLORS = { 'G':'#22c55e','PG':'#84cc16','PG-13':'#f59e0b','R':'#ef4444','NC-17':'#dc2626' };

const MOVIE_BANK = {
  happy:   [{id:862,title:'Toy Story',emoji:'🤠',color:'#1a1a3a',cert:'G',rating:8.3},{id:13,title:'Forrest Gump',emoji:'🏃',color:'#1a3a1a',cert:'PG-13',rating:8.8},{id:14160,title:'Up',emoji:'🏠',color:'#1a3a3a',cert:'PG',rating:8.3},{id:354912,title:'Coco',emoji:'🎸',color:'#2a0a1a',cert:'PG',rating:8.4},{id:10193,title:'Toy Story 3',emoji:'🐻',color:'#1a1a2a',cert:'G',rating:8.3}],
  sad:     [{id:637,title:'Life is Beautiful',emoji:'🌹',color:'#2a1a0a',cert:'PG-13',rating:8.6},{id:278,title:'Shawshank Redemption',emoji:'🔓',color:'#2a1a0a',cert:'R',rating:9.3},{id:77338,title:'The Intouchables',emoji:'🤝',color:'#0a1a2a',cert:'R',rating:8.5},{id:10681,title:'WALL·E',emoji:'🤖',color:'#1a2a3a',cert:'G',rating:8.4}],
  excited: [{id:24428,title:'The Avengers',emoji:'🛡️',color:'#1a0a0a',cert:'PG-13',rating:8.0},{id:157336,title:'Interstellar',emoji:'🚀',color:'#0a1a2a',cert:'PG-13',rating:8.7},{id:155,title:'The Dark Knight',emoji:'🦇',color:'#0a0a1a',cert:'PG-13',rating:9.0},{id:19995,title:'Avatar',emoji:'🌿',color:'#0a2a1a',cert:'PG-13',rating:7.9}],
  relaxed: [{id:637,title:'Life is Beautiful',emoji:'🌹',color:'#2a1a0a',cert:'PG-13',rating:8.6},{id:129,title:'Spirited Away',emoji:'🌸',color:'#2a1a2a',cert:'PG',rating:8.6},{id:10681,title:'WALL·E',emoji:'🤖',color:'#1a2a3a',cert:'G',rating:8.4},{id:77338,title:'The Intouchables',emoji:'🤝',color:'#0a1a2a',cert:'R',rating:8.5}],
  bored:   [{id:603,title:'The Matrix',emoji:'💊',color:'#0a2a0a',cert:'R',rating:8.7},{id:155,title:'The Dark Knight',emoji:'🦇',color:'#0a0a1a',cert:'PG-13',rating:9.0},{id:157336,title:'Interstellar',emoji:'🚀',color:'#0a1a2a',cert:'PG-13',rating:8.7},{id:550,title:'Fight Club',emoji:'👊',color:'#1a0a0a',cert:'R',rating:8.8}],
  romantic:[{id:637,title:'Life is Beautiful',emoji:'🌹',color:'#2a1a0a',cert:'PG-13',rating:8.6},{id:13,title:'Forrest Gump',emoji:'🏃',color:'#1a3a1a',cert:'PG-13',rating:8.8},{id:77338,title:'The Intouchables',emoji:'🤝',color:'#0a1a2a',cert:'R',rating:8.5}],
  scared:  [{id:862,title:'Toy Story',emoji:'🤠',color:'#1a1a3a',cert:'G',rating:8.3},{id:10681,title:'WALL·E',emoji:'🤖',color:'#1a2a3a',cert:'G',rating:8.4},{id:129,title:'Spirited Away',emoji:'🌸',color:'#2a1a2a',cert:'PG',rating:8.6}],
  angry:   [{id:24428,title:'The Avengers',emoji:'🛡️',color:'#1a0a0a',cert:'PG-13',rating:8.0},{id:155,title:'The Dark Knight',emoji:'🦇',color:'#0a0a1a',cert:'PG-13',rating:9.0},{id:603,title:'The Matrix',emoji:'💊',color:'#0a2a0a',cert:'R',rating:8.7}],
};

const detectEmotion = text => {
  const t = text.toLowerCase();
  if (/happy|joy|great|good|amazing|wonderful|excited|glad|laugh|fun/.test(t)) return 'happy';
  if (/sad|depress|cry|lonely|down|upset|bad|miss|heartbreak/.test(t))          return 'sad';
  if (/excit|pump|hype|energy|thrill|ready|wow/.test(t))                        return 'excited';
  if (/relax|calm|chill|peace|easy|slow|tire|rest|sleep/.test(t))               return 'relaxed';
  if (/bored|boring|nothing|dull|empty|meh/.test(t))                            return 'bored';
  if (/love|romantic|date|crush|miss|heart|couple/.test(t))                     return 'romantic';
  if (/scar|afraid|anxious|nervous|worried|fear/.test(t))                       return 'scared';
  if (/angry|mad|furious|annoy|frustrat|rage|stress/.test(t))                   return 'angry';
  return 'bored';
};

const QUICK_PILLS = {
  en: ["I'm bored 😑","I feel happy 😊","I'm excited 🤩","Feeling sad 😢","I want action 💥","Something relaxing 😌"],
  fr: ["Je m'ennuie 😑","Je suis joyeux 😊","Je suis excité 🤩","Je me sens triste 😢","Je veux de l'action 💥","Quelque chose de calme 😌"],
  tn: ["عياني 😑","فرحان 😊","متحمس 🤩","حزين شوية 😢","نحب أكشن 💥","حاجة هادئة 😌"],
};

const LOADING_MSGS = {
  en:['Reading your mood…','Searching the catalogue…','Matching your taste…'],
  fr:['Lecture de votre humeur…','Recherche dans le catalogue…','Sélection des meilleurs films…'],
  tn:['قاعد يقرا مزاجك…','يبحث في القائمة…','يوافق ذوقك…'],
};

const AIRecommendationsPage = () => {
  const { user }        = useAuth();
  const { lang, isRTL } = useLang();
  const navigate        = useNavigate();
  const [answer, setAnswer]     = useState('');
  const [step, setStep]         = useState('ask');
  const [results, setResults]   = useState([]);
  const [aiMsg, setAiMsg]       = useState('');
  const [loadIdx, setLoadIdx]   = useState(0);
  const [favorites, setFavorites] = useState([]);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 400); }, []);

  useEffect(() => {
    if (!user) return;
    favoritesAPI.getAll().then(({ data }) => setFavorites(data.favorites || [])).catch(() => {});
  }, [user]);

  const go = async () => {
    if (!answer.trim()) return;
    const emotion = detectEmotion(answer);
    setStep('loading');
    timerRef.current = setInterval(() => setLoadIdx(i => (i+1) % 3), 900);

    try {
      const favTitles = favorites.slice(0,8).map(f => f.movieTitle).join(', ');
      const res = await fetch('/api/ai-recommendations', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(localStorage.getItem('shoufli_token')&&{ Authorization:`Bearer ${localStorage.getItem('shoufli_token')}` }) },
        body: JSON.stringify({ mood:emotion, freeText:answer, lang, favoriteTitles:favTitles }),
      });

      let movies = [], message = '';
      if (res.ok) { const d = await res.json(); movies=d.movies||[]; message=d.message||''; }

      // Local fallback always guaranteed
      if (!movies.length) {
        movies = [...(MOVIE_BANK[emotion] || MOVIE_BANK.bored)];
        const favIds = new Set(favorites.map(f => f.movieId));
        const fresh = movies.filter(m => !favIds.has(m.id));
        if (fresh.length >= 2) movies = fresh;
      }

      if (!message) {
        const msgs = {
          happy:{en:"You're in a great mood! 🎉 Here are some feel-good films:",fr:"Super humeur ! 🎉 Des films pour prolonger la joie :",tn:"مزاجك زين! 🎉 هاذم يكملوا الفرحة:"},
          sad:{en:"Feeling down? 💙 These will lift your spirits:",fr:"Triste ? 💙 De quoi remonter le moral :",tn:"حزين؟ 💙 هاذم يرفعوا روحك:"},
          excited:{en:"You're pumped! 🚀 Some epic films for your energy:",fr:"Excité ! 🚀 Des films épiques à la hauteur :",tn:"متحمس! 🚀 أفلام ملحمية على قد طاقتك:"},
          relaxed:{en:"Chill vibes 🌿 — some beautiful easy-going films:",fr:"Ambiance zen 🌿 — des films apaisants :",tn:"هادئ 🌿 — أفلام جميلة وهنية:"},
          bored:{en:"Boredom ends here! ⚡ These will hook you instantly:",fr:"Fini l'ennui ! ⚡ Ces films vous captiveront :",tn:"الملل خلاص! ⚡ هاذم يشدوك من الدقيقة الأولى:"},
          romantic:{en:"Romantic mood? 💕 Some beautiful love stories:",fr:"Humeur romantique ? 💕 De belles histoires d'amour :",tn:"رومانسي؟ 💕 قصص حب جميلة:"},
          scared:{en:"Feeling anxious? 🌟 Light-hearted films to calm you:",fr:"Anxieux ? 🌟 Des films légers pour vous apaiser :",tn:"خايف؟ 🌟 أفلام خفيفة تهدئك:"},
          angry:{en:"Need to let off steam? 💥 Some intense action:",fr:"Besoin de décompresser ? 💥 De l'action intense :",tn:"مزعّق؟ 💥 أكشن قوي على قد مزاجك:"},
        };
        message = msgs[emotion]?.[lang] || msgs[emotion]?.en || '🎬 Here are your picks!';
      }

      setResults(movies.slice(0, 8));
      setAiMsg(message);
      setStep('results');
    } catch {
      setResults(MOVIE_BANK[detectEmotion(answer)] || MOVIE_BANK.bored);
      setAiMsg('🎬 Here are some picks based on your mood!');
      setStep('results');
    } finally { clearInterval(timerRef.current); }
  };

  const reset = () => { setStep('ask'); setAnswer(''); setResults([]); setAiMsg(''); setTimeout(() => inputRef.current?.focus(), 200); };

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ minHeight:'100vh',paddingTop:64,background:'var(--cd)' }} className="page-enter">

      {/* Hero */}
      <div style={{ position:'relative',overflow:'hidden',padding:'2.5rem 1.5rem 2rem',textAlign:'center',background:'linear-gradient(180deg,rgba(229,9,20,.07) 0%,transparent 100%)' }}>
        <div style={{ position:'absolute',top:-80,left:'50%',transform:'translateX(-50%)',width:500,height:240,background:'radial-gradient(ellipse,rgba(229,9,20,.12) 0%,transparent 70%)',pointerEvents:'none' }}/>
        <div style={{ position:'relative',zIndex:1 }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:7,background:'rgba(229,9,20,.12)',border:'1px solid rgba(229,9,20,.3)',borderRadius:20,padding:'4px 14px',fontSize:'.75rem',fontWeight:700,color:'#ff6060',marginBottom:'.875rem',textTransform:'uppercase',letterSpacing:'.06em' }}>✨ Shoufli AI</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(2rem,5vw,3.5rem)',margin:'0 0 .5rem',color:'var(--ct)' }}>
            {lang==='tn'?'Shoufli AI — أفلام على قد مزاجك':lang==='fr'?'Shoufli AI — Films Pour Votre Humeur':'Shoufli AI — Films For Your Mood'}
          </h1>
          <p style={{ color:'var(--cm)',fontSize:'clamp(.875rem,1.5vw,1rem)',margin:'0 auto',maxWidth:520,lineHeight:1.7 }}>
            {lang==='tn'?'قول لـ Shoufli AI كيفاش تحس — يلقالك الأفلام المناسبة':lang==='fr'?"Dites à Shoufli AI comment vous vous sentez — il trouve les films parfaits":'Tell Shoufli AI how you feel — it finds the perfect films for you'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth:720,margin:'0 auto',padding:'0 1.5rem 4rem' }}>

        {/* ASK */}
        {step==='ask' && (
          <div className="cinema-card" style={{ padding:'2rem',marginTop:'.5rem' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem' }}>
              <div style={{ width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#e50914,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',boxShadow:'0 4px 16px rgba(229,9,20,.35)',flexShrink:0 }}>🤖</div>
              <div>
                <p style={{ margin:0,fontSize:'.7rem',fontWeight:700,color:'var(--cr)',textTransform:'uppercase',letterSpacing:'.08em' }}>Shoufli AI</p>
                <p style={{ margin:0,fontSize:'1.05rem',fontWeight:600,color:'var(--ct)',lineHeight:1.4 }}>
                  {lang==='tn'?'كيفاش تحس روحك الليلة؟ 🎬':lang==='fr'?'Comment vous sentez-vous ce soir ? 🎬':'How are you feeling tonight? 🎬'}
                </p>
              </div>
            </div>

            <textarea ref={inputRef} value={answer} onChange={e=>setAnswer(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go();} }}
              placeholder={lang==='tn'?'مثلاً: "عياني نحب شي يشدني" أو "فرحان نحب كوميديا"…':lang==='fr'?'ex. "Je m\'ennuie et veux du suspense" ou "Je suis content, cherche une comédie"…':"e.g. \"I'm bored and want something thrilling\" or \"I feel happy, looking for a comedy\"…"}
              className="cinema-input" style={{ minHeight:110,resize:'none',fontSize:'.95rem',lineHeight:1.7,direction:isRTL?'rtl':'ltr' }} maxLength={300}/>

            {/* Quick pills */}
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'.5rem',flexWrap:'wrap',gap:'.5rem' }}>
              <div style={{ display:'flex',gap:'.4rem',flexWrap:'wrap' }}>
                {(QUICK_PILLS[lang]||QUICK_PILLS.en).map(p => (
                  <button key={p} onClick={()=>{ setAnswer(p); setTimeout(()=>inputRef.current?.focus(),50); }}
                    style={{ padding:'3px 10px',borderRadius:14,border:'1px solid var(--cb)',background:'var(--cd3)',color:'var(--cm)',fontSize:'.75rem',cursor:'pointer' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--cr)';e.currentTarget.style.color='var(--ct)';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--cb)';e.currentTarget.style.color='var(--cm)';}}>
                    {p}
                  </button>
                ))}
              </div>
              <span style={{ fontSize:'.72rem',color:'var(--cm)' }}>{answer.length}/300</span>
            </div>

            <button className="btn-primary" onClick={go} style={{ width:'100%',justifyContent:'center',padding:'.9rem',fontSize:'1rem',marginTop:'1.25rem' }}>
              {lang==='tn'?'✨ لقالي أفلام':lang==='fr'?'✨ Trouver Mes Films':'✨ Find My Movies'}
            </button>

            {user && (
              <p style={{ margin:'.875rem 0 0',fontSize:'.75rem',color:'var(--cm)',textAlign:'center' }}>
                {lang==='tn'?`✓ عندنا ${favorites.length} فيلم من قائمتك للتخصيص`:lang==='fr'?`✓ ${favorites.length} film(s) de votre liste pris en compte`:`✓ ${favorites.length} saved film(s) considered for personalisation`}
              </p>
            )}
          </div>
        )}

        {/* LOADING */}
        {step==='loading' && (
          <div style={{ textAlign:'center',padding:'5rem 2rem' }}>
            <div style={{ width:70,height:70,borderRadius:'50%',margin:'0 auto 1.5rem',background:'linear-gradient(135deg,#e50914,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',animation:'spin 2s linear infinite',boxShadow:'0 0 40px rgba(229,9,20,.3)' }}>🤖</div>
            <h2 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'2rem',margin:'0 0 .5rem',color:'var(--ct)' }}>{(LOADING_MSGS[lang]||LOADING_MSGS.en)[loadIdx]}</h2>
            <div style={{ width:200,height:3,background:'var(--cd3)',borderRadius:2,margin:'1.5rem auto 0',overflow:'hidden' }}>
              <div style={{ height:'100%',background:'linear-gradient(90deg,#e50914,#7c3aed)',borderRadius:2,animation:'loadBar 1.6s ease-in-out infinite' }}/>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes loadBar{0%{width:0;margin-left:0}50%{width:100%}100%{width:0;margin-left:100%}}`}</style>
          </div>
        )}

        {/* RESULTS */}
        {step==='results' && (
          <div>
            {/* AI bubble */}
            <div style={{ background:'linear-gradient(135deg,rgba(229,9,20,.08),rgba(124,58,237,.08))',border:'1px solid rgba(229,9,20,.2)',borderRadius:14,padding:'1.125rem 1.375rem',margin:'.5rem 0 1.75rem',display:'flex',alignItems:'flex-start',gap:'.875rem' }}>
              <div style={{ width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#e50914,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0 }}>🤖</div>
              <div>
                <p style={{ margin:'0 0 2px',fontSize:'.7rem',fontWeight:700,color:'var(--cr)',textTransform:'uppercase',letterSpacing:'.08em' }}>Shoufli AI</p>
                <p style={{ margin:0,color:'var(--ct)',fontSize:'.95rem',lineHeight:1.65 }}>{aiMsg}</p>
              </div>
            </div>

            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem',flexWrap:'wrap',gap:'.75rem' }}>
              <h2 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'1.7rem',margin:0,color:'var(--ct)' }}>
                {lang==='tn'?'🎬 اختياراتك الشخصية':lang==='fr'?'🎬 Vos Sélections':'🎬 Your Personalised Picks'}
              </h2>
              <button className="btn-ghost" onClick={reset} style={{ fontSize:'.875rem' }}>
                ↩ {lang==='tn'?'جرب مرة أخرى':lang==='fr'?'Réessayer':'Try Again'}
              </button>
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(148px,1fr))',gap:'1rem' }}>
              {results.map((movie, idx) => {
                const cert = movie.certification||movie.cert;
                const certColor = CERT_COLORS[cert]||'rgba(255,255,255,.3)';
                const rating = movie.vote_average||movie.rating||0;
                const saved = favorites.some(f => f.movieId===movie.id);
                return (
                  <div key={movie.id||idx} className="cinema-card" style={{ overflow:'hidden',cursor:'pointer',padding:0,transition:'transform .2s,box-shadow .2s' }}
                    onClick={() => navigate(`/movie/${movie.id}`)}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='0 14px 36px rgba(0,0,0,.6)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='';}}>
                    <div style={{ position:'relative',paddingTop:'150%',background:'var(--cd3)' }}>
                      {movie.poster_path
                        ? <img src={tmdbImage(movie.poster_path,'w342')} alt={movie.title} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover' }} onError={e=>e.target.style.display='none'}/>
                        : <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,background:`linear-gradient(135deg,${movie.color||'#1a0a0f'},#0a0a1a)` }}>
                            <span style={{ fontSize:'2.5rem' }}>{movie.emoji||'🎬'}</span>
                            <span style={{ fontSize:8,color:'rgba(255,255,255,.4)',padding:'0 8px',textAlign:'center' }}>{movie.title}</span>
                          </div>
                      }
                      {rating>0&&<div style={{ position:'absolute',top:6,right:6,background:'rgba(0,0,0,.85)',borderRadius:5,padding:'2px 5px',fontSize:9,fontWeight:700,color:rating>=7?'#f5c518':'#a0a0b0',border:'.5px solid rgba(255,255,255,.12)' }}>★ {parseFloat(rating).toFixed(1)}</div>}
                      {cert&&<div style={{ position:'absolute',top:6,left:6,background:'rgba(0,0,0,.85)',border:`1px solid ${certColor}`,borderRadius:4,padding:'1px 5px',fontSize:8,fontWeight:700,color:certColor }}>{cert}</div>}
                      {saved&&<div style={{ position:'absolute',bottom:6,left:6,background:'rgba(0,0,0,.85)',borderRadius:4,padding:'2px 6px',fontSize:7,fontWeight:700,color:'#f43f5e' }}>❤️ Saved</div>}
                      <div style={{ position:'absolute',bottom:6,right:6,background:'rgba(229,9,20,.9)',borderRadius:4,padding:'2px 5px',fontSize:7,fontWeight:700,color:'white' }}>🤖 AI</div>
                    </div>
                    <div style={{ padding:'9px 10px 11px' }}>
                      <p style={{ margin:'0 0 1px',fontSize:'.82rem',fontWeight:600,color:'var(--ct)',lineHeight:1.3,overflow:'hidden',textOverflow:'ellipsis',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>{movie.title}</p>
                      <p style={{ margin:0,fontSize:'.7rem',color:'var(--cm)' }}>{movie.year||movie.release_date?.slice(0,4)||''}{cert&&<span style={{ color:certColor,marginLeft:5,fontWeight:600 }}>{cert}</span>}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendationsPage;
