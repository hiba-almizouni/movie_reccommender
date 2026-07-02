// ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { authAPI } from '../services/api';
import LangSwitcher from '../components/ui/LangSwitcher';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const { t, lang, isRTL } = useLang();
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try { await authAPI.forgotPassword(email, lang); setSent(true); }
    catch { setSent(true); } // Always show success to prevent enumeration
    finally { setLoading(false); }
  };

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cd)',backgroundImage:'radial-gradient(ellipse 80% 60% at 50% -20%,rgba(229,9,20,.1) 0%,transparent 60%)',padding:'1rem' }}>
      <div style={{ position:'fixed',top:'1rem',right:'1rem' }}><LangSwitcher/></div>
      <div className="cinema-card page-enter" style={{ width:'100%',maxWidth:420,padding:'2.5rem 2rem' }}>
        <div style={{ textAlign:'center',marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.5rem',marginBottom:'.5rem' }}>{sent?'✉️':'🔑'}</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'2rem',margin:'0 0 .5rem',color:'var(--ct)' }}>{sent?(lang==='tn'?'تم الإرسال!':lang==='fr'?'Envoyé !':'Sent!'):t('forgotTitle')}</h1>
          <p style={{ color:'var(--cm)',fontSize:'.875rem',margin:0 }}>{sent?t('resetSent'):t('forgotSub')}</p>
        </div>
        {!sent?(
          <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
            <div>
              <label style={{ display:'block',marginBottom:'.4rem',fontSize:'.85rem',fontWeight:600,color:'var(--ct)' }}>{t('emailLabel')}</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('emailPh')} className="cinema-input" style={{ textAlign:isRTL?'right':'left' }} required/>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width:'100%',justifyContent:'center',padding:'.85rem',fontSize:'1rem',marginTop:'.25rem' }}>
              {loading?<span style={{ display:'flex',alignItems:'center',gap:'.5rem' }}><span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block' }}/>{t('sending')}</span>:t('sendResetBtn')}
            </button>
          </form>
        ):(
          <div style={{ textAlign:'center' }}>
            <div style={{ background:'rgba(34,197,94,.1)',border:'1px solid rgba(34,197,94,.3)',borderRadius:10,padding:'1rem',marginBottom:'1.5rem' }}>
              <p style={{ color:'#86efac',fontSize:'.875rem',margin:0 }}>{t('resetSent')}</p>
            </div>
            <button onClick={()=>{setSent(false);setEmail('');}} className="btn-ghost" style={{ width:'100%',justifyContent:'center' }}>
              {lang==='tn'?'إرسال لبريد آخر':lang==='fr'?'Essayer un autre email':'Try another email'}
            </button>
          </div>
        )}
        <div style={{ marginTop:'1.5rem',textAlign:'center',borderTop:'1px solid var(--cb)',paddingTop:'1.25rem' }}>
          <Link to="/login" style={{ color:'var(--cr)',fontWeight:600,textDecoration:'none',fontSize:'.875rem' }}>{t('backToLogin')}</Link>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
export default ForgotPasswordPage;
