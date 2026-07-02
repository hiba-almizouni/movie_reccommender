import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import LangSwitcher from '../ui/LangSwitcher';

const Navbar = () => {
  const { user, logout, activeProfile, isChild } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);

  useEffect(() => {
    const f = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);

  useEffect(() => { setMobileOpen(false); setMenuOpen(false); }, [location.pathname]);

  const handleSearch = e => {
    e.preventDefault();
    if (query.trim()) { navigate(`/search?q=${encodeURIComponent(query.trim())}`); setQuery(''); }
  };

  const isActive = to => location.pathname === to || location.pathname.startsWith(to + '/');

  const navLinks = isChild
    ? [{ to:'/', label:t('home') }, { to:'/favorites', label:t('myList') }]
    : [
        { to:'/', label:t('home') },
        { to:'/browse', label:t('browse') },
        { to:'/search', label:t('search') },
        { to:'/favorites', label:t('myList') },
        { to:'/ai-picks', label:t('shoufliAI') },
        ...(user?.isParent ? [{ to:'/parental', label:'🛡 ' + t('parental') }] : []),
      ];

  const lnkStyle = to => ({
    textDecoration:'none', fontSize:'.875rem', fontWeight:600,
    color: isActive(to) ? 'var(--ct)' : 'var(--cm)',
    borderBottom: isActive(to) ? '2px solid var(--cr)' : '2px solid transparent',
    paddingBottom:2, transition:'color .2s,border-color .2s',
  });

  return (
    <nav className={scrolled ? 'navbar-glass' : ''} style={{ position:'fixed',top:0,left:0,right:0,zIndex:50,transition:'all .3s', ...(scrolled ? {} : { background:'linear-gradient(to bottom,rgba(0,0,0,.8),transparent)' }) }}>
      <div style={{ maxWidth:1280,margin:'0 auto',padding:'0 1.5rem' }}>
        <div style={{ display:'flex',alignItems:'center',height:64,gap:'1.5rem' }}>

          {/* Logo */}
          <Link to="/" style={{ display:'flex',alignItems:'center',gap:'.4rem',textDecoration:'none',flexShrink:0 }}>
            <span style={{ fontSize:'1.4rem' }}>🎬</span>
            <span style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'1.5rem',letterSpacing:'.08em',color:'var(--ct)' }}>
              Shoufli <span style={{ color:'var(--cr)' }}>Movie</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display:'flex',alignItems:'center',gap:'1.25rem' }}>
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} style={lnkStyle(l.to)}
                onMouseEnter={e=>e.currentTarget.style.color='var(--ct)'}
                onMouseLeave={e=>e.currentTarget.style.color=isActive(l.to)?'var(--ct)':'var(--cm)'}>
                {l.label}
              </Link>
            ))}
          </div>

          <div style={{ flex:1 }}/>

          {/* Search */}
          {!isChild && (
            <form onSubmit={handleSearch} style={{ position:'relative',display:'flex' }}>
              <input type="text" value={query} onChange={e=>setQuery(e.target.value)}
                placeholder={t('search') + '…'} className="cinema-input"
                style={{ width:180,padding:'.5rem .75rem .5rem 2.2rem',borderRadius:20,fontSize:'.85rem' }}/>
              <span style={{ position:'absolute',left:'.65rem',top:'50%',transform:'translateY(-50%)',fontSize:'.8rem',color:'var(--cm)',pointerEvents:'none' }}>🔍</span>
            </form>
          )}

          <LangSwitcher compact/>

          <button className="btn-icon" onClick={toggleTheme} style={{ fontSize:'1rem' }}>
            {isDark ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div ref={menuRef} style={{ position:'relative' }}>
              <button onClick={() => setMenuOpen(v=>!v)} style={{ display:'flex',alignItems:'center',gap:'.5rem',background:'var(--cd3)',border:'1px solid var(--cb)',borderRadius:24,padding:'.35rem .9rem .35rem .5rem',cursor:'pointer' }}>
                <span style={{ fontSize:'1.25rem' }}>{activeProfile?.avatar || '👤'}</span>
                <span style={{ fontSize:'.85rem',color:'var(--ct)',fontWeight:600,maxWidth:90,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                  {activeProfile?.name || user.username}
                </span>
                <span style={{ fontSize:'.6rem',color:'var(--cm)' }}>{menuOpen?'▲':'▼'}</span>
              </button>
              {menuOpen && (
                <div style={{ position:'absolute',right:0,top:'calc(100% + 8px)',width:200,background:'var(--cd2)',border:'1px solid var(--cb)',borderRadius:14,boxShadow:'0 16px 48px rgba(0,0,0,.7)',overflow:'hidden',animation:'fadeIn .2s ease' }}>
                  <div style={{ padding:'.75rem 1rem',borderBottom:'1px solid var(--cb)' }}>
                    <p style={{ margin:0,fontWeight:700,fontSize:'.9rem',color:'var(--ct)' }}>{user.username}</p>
                    <p style={{ margin:0,fontSize:'.72rem',color:'var(--cm)' }}>{user.email}</p>
                  </div>
                  {[
                    { to:'/profiles', icon:'👥', label:t('profiles') },
                    { to:'/history',  icon:'🕐', label:t('watchHistory') },
                    { to:'/favorites',icon:'❤️', label:t('myList') },
                    { to:'/settings', icon:'⚙️', label:t('settings') },
                    ...(user.isParent ? [{ to:'/parental', icon:'🛡', label:t('parental') }] : []),
                  ].map(item => (
                    <Link key={item.to} to={item.to} style={{ display:'flex',alignItems:'center',gap:'.75rem',padding:'.6rem 1rem',textDecoration:'none',fontSize:'.875rem',color:'var(--ct)',transition:'background .15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--cd3)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <span>{item.icon}</span>{item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop:'1px solid var(--cb)' }}>
                    <button onClick={()=>{logout();navigate('/');}} style={{ display:'flex',alignItems:'center',gap:'.75rem',width:'100%',padding:'.6rem 1rem',background:'none',border:'none',cursor:'pointer',fontSize:'.875rem',color:'#f87171',textAlign:'left' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--cd3)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      🚪 {t('signOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display:'flex', gap:'.5rem' }}>
              <Link to="/login"    className="btn-ghost"   style={{ textDecoration:'none',padding:'.45rem 1rem',fontSize:'.875rem' }}>{t('signIn')}</Link>
              <Link to="/register" className="btn-primary" style={{ textDecoration:'none',padding:'.45rem 1rem',fontSize:'.875rem' }}>{t('joinFree')}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
