import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatbotAPI, tmdbImage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const WELCOME = "Hi! I'm Shoufli AI 🎬\nTell me how you feel and I'll find the perfect movie!\n\nTry: \"I feel sad\" or \"I'm bored\"";

const ChatbotWidget = () => {
  const { isChild } = useAuth();
  const navigate    = useNavigate();
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([{ role:'bot', text:WELCOME, movies:[] }]);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150); }, [open]);

  // Listen for mood events from child mode
  useEffect(() => {
    const handler = e => {
      const msg = e.detail?.message;
      if (!msg) return;
      setOpen(true);
      setTimeout(() => sendMsg(msg), 300);
    };
    window.addEventListener('shoufli:chatbot:open', handler);
    return () => window.removeEventListener('shoufli:chatbot:open', handler);
  // eslint-disable-next-line
  }, []);

  const sendMsg = async (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role:'user', text:t }]);
    setLoading(true);
    try {
      const history = messages.slice(-6).map(m => ({ role:m.role==='user'?'user':'assistant', content:m.text }));
      const { data } = await chatbotAPI.chat({ message:t, history, isChild });
      setMessages(prev => [...prev, { role:'bot', text:data.response, emotion:data.emotion, movies:data.movies||[] }]);
    } catch (e) {
      setMessages(prev => [...prev, { role:'bot', text:"Oops! Something went wrong. Try again 🎬", movies:[] }]);
    } finally { setLoading(false); }
  };

  const send = () => sendMsg(input);
  const handleKey = e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const quickPrompts = ['I feel sad 😢','I\'m excited 🤩','I\'m bored 😑','Something relaxing 😌'];

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(v=>!v)} style={{ position:'fixed',bottom:'2rem',right:'2rem',zIndex:1000,width:58,height:58,borderRadius:'50%',border:'none',cursor:'pointer',background:isChild?'linear-gradient(135deg,#6c63ff,#a855f7)':'linear-gradient(135deg,var(--cr),#c00)',color:'white',fontSize:'1.4rem',boxShadow:'0 4px 20px rgba(229,9,20,.5)',display:'flex',alignItems:'center',justifyContent:'center',transition:'transform .2s'}}
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{ position:'fixed',bottom:'6rem',right:'2rem',zIndex:999,width:'clamp(310px,90vw,390px)',height:520,background:'var(--cd2)',borderRadius:16,border:'1px solid var(--cb)',boxShadow:'0 20px 60px rgba(0,0,0,.7)',display:'flex',flexDirection:'column',overflow:'hidden',animation:'slideUp .25s ease-out' }}>
          {/* Header */}
          <div style={{ padding:'.875rem 1.25rem',background:'linear-gradient(135deg,var(--cr),#a00)',display:'flex',alignItems:'center',gap:'.75rem' }}>
            <div style={{ width:34,height:34,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem' }}>🤖</div>
            <div>
              <p style={{ margin:0,fontWeight:700,color:'white',fontSize:'.9rem' }}>Shoufli AI</p>
              <p style={{ margin:0,fontSize:'.7rem',color:'rgba(255,255,255,.7)' }}>Mood-powered film picks</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1,overflowY:'auto',padding:'1rem',display:'flex',flexDirection:'column',gap:'.75rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display:'flex',flexDirection:'column',alignItems:msg.role==='user'?'flex-end':'flex-start',gap:'.4rem' }}>
                {msg.emotion && <div style={{ fontSize:'.68rem',color:'var(--cm)' }}>Detected: <strong style={{ color:'var(--ct)' }}>{msg.emotion}</strong></div>}
                <div className={msg.role==='user'?'chatbot-bubble-user':'chatbot-bubble-bot'}>
                  {msg.text.split('\n').map((line,j) => <span key={j}>{line}{j<msg.text.split('\n').length-1&&<br/>}</span>)}
                </div>
                {/* Movie thumbnails */}
                {msg.movies?.length>0 && (
                  <div style={{ display:'flex',gap:'.4rem',overflowX:'auto',paddingBottom:4,maxWidth:'100%' }}>
                    {msg.movies.slice(0,4).map(m => (
                      <div key={m.id} onClick={() => { navigate(`/movie/${m.id}`); setOpen(false); }}
                        style={{ flexShrink:0,width:66,cursor:'pointer',borderRadius:7,overflow:'hidden',border:'1px solid var(--cb)',transition:'transform .15s' }}
                        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'}
                        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                        {m.poster_path
                          ? <img src={tmdbImage(m.poster_path,'w92')} alt={m.title} style={{ width:'100%',height:99,objectFit:'cover',display:'block' }} onError={e=>e.target.style.display='none'}/>
                          : <div style={{ width:'100%',height:99,background:`linear-gradient(135deg,${m.color||'#1a0a0f'},#0a0a1a)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.6rem' }}>{m.emoji||'🎬'}</div>
                        }
                        <p style={{ margin:0,padding:'3px 4px',fontSize:'.58rem',color:'var(--ct)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{m.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chatbot-bubble-bot" style={{ display:'flex',gap:4,alignItems:'center' }}>
                {[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:'50%',background:'var(--cm)',animation:`bounce .8s ${i*.15}s infinite` }}/>)}
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick prompts */}
          {messages.length<=2 && (
            <div style={{ padding:'0 .875rem .5rem',display:'flex',gap:'.4rem',flexWrap:'wrap' }}>
              {quickPrompts.map(p => (
                <button key={p} onClick={() => sendMsg(p)} style={{ background:'var(--cd3)',border:'1px solid var(--cb)',borderRadius:14,padding:'3px 9px',fontSize:'.72rem',color:'var(--ct)',cursor:'pointer' }}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:'.75rem',borderTop:'1px solid var(--cb)',display:'flex',gap:'.5rem' }}>
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
              placeholder="How are you feeling?" className="cinema-input"
              style={{ borderRadius:18,padding:'.5rem .9rem',fontSize:'.875rem' }} disabled={loading}/>
            <button onClick={send} disabled={loading||!input.trim()} style={{ width:38,height:38,borderRadius:'50%',border:'none',cursor:'pointer',background:input.trim()?'var(--cr)':'var(--cd4)',color:'white',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>➤</button>
          </div>
        </div>
      )}
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
};

export default ChatbotWidget;
