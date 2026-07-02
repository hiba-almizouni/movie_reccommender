import React, { useState, useRef, useEffect } from 'react';
import { useLang, LANGUAGES } from '../../context/LangContext';

const LangSwitcher = ({ compact = false }) => {
  const { lang, setLang, currentLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 100 }}>
      <button onClick={() => setOpen(v => !v)} style={{ display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,.08)',border:'1px solid var(--cb)',borderRadius:20,padding:compact?'4px 8px':'5px 12px',cursor:'pointer',color:'var(--ct)',fontSize:'.82rem' }}>
        <span style={{ fontSize: '1rem' }}>{currentLang.flag}</span>
        {!compact && <span>{currentLang.label}</span>}
        <span style={{ fontSize: '.6rem', color: 'var(--cm)' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ position:'absolute',right:0,top:'calc(100% + 6px)',background:'var(--cd2)',border:'1px solid var(--cb)',borderRadius:10,overflow:'hidden',zIndex:999,boxShadow:'0 12px 32px rgba(0,0,0,.6)',minWidth:140 }}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }} style={{ display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 14px',background:l.code===lang?'rgba(229,9,20,.08)':'transparent',border:'none',borderLeft:`3px solid ${l.code===lang?'var(--cr)':'transparent'}`,cursor:'pointer',fontSize:'.875rem',color:'var(--ct)',textAlign:'left' }}>
              <span style={{ fontSize: '1.1rem' }}>{l.flag}</span>
              <span>{l.label}</span>
              {l.code === lang && <span style={{ marginLeft:'auto',color:'var(--cr)',fontSize:'.75rem' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LangSwitcher;
