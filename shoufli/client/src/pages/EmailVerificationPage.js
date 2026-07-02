import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { authAPI } from '../services/api';
import LangSwitcher from '../components/ui/LangSwitcher';
import toast from 'react-hot-toast';

const EmailVerificationPage = () => {
  const { user, refreshUser } = useAuth();
  const { t, isRTL } = useLang();
  const navigate = useNavigate();
  const [digits, setDigits]       = useState(['','','','','','']);
  const [loading, setLoading]     = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const refs = useRef([]);

  useEffect(() => { if (!user) navigate('/login'); if (user?.isEmailVerified) navigate('/'); }, [user, navigate]);
  useEffect(() => { if (countdown<=0) { setCanResend(true); return; } const t=setTimeout(()=>setCountdown(c=>c-1),1000); return()=>clearTimeout(t); }, [countdown]);

  const code = digits.join('');

  const handleDigit = (idx, val) => {
    const v = val.replace(/\D/g,'').slice(-1);
    const next = [...digits]; next[idx]=v; setDigits(next);
    if (v && idx<5) refs.current[idx+1]?.focus();
  };

  const handleKey = (idx, e) => {
    if (e.key==='Backspace' && !digits[idx] && idx>0) refs.current[idx-1]?.focus();
  };

  const handlePaste = e => {
    const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (p.length===6) { setDigits(p.split('')); refs.current[5]?.focus(); }
  };

  const verify = async () => {
    if (code.length<6) return toast.error('Please enter all 6 digits');
    setLoading(true);
    try {
      await authAPI.verifyEmail(code);
      await refreshUser();
      toast.success('✅ Email verified! Welcome to Shoufli Movie!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired code');
      setDigits(['','','','','','']);
      refs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const resend = async () => {
    if (!canResend) return;
    try {
      await authAPI.resendVerification();
      toast.success('New code sent! ✉️');
      setCountdown(60); setCanResend(false);
      setDigits(['','','','','','']);
      refs.current[0]?.focus();
    } catch { toast.error('Failed to resend'); }
  };

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cd)',backgroundImage:'radial-gradient(ellipse 80% 60% at 50% -20%,rgba(229,9,20,.1) 0%,transparent 60%)',padding:'1rem' }}>
      <div style={{ position:'fixed',top:'1rem',right:'1rem' }}><LangSwitcher/></div>
      <div className="cinema-card page-enter" style={{ width:'100%',maxWidth:440,padding:'2.5rem 2rem',textAlign:'center' }}>
        <div style={{ fontSize:'3rem',marginBottom:'1rem' }}>📧</div>
        <h1 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'2rem',margin:'0 0 .5rem',color:'var(--ct)' }}>{t('verifyTitle')}</h1>
        <p style={{ color:'var(--cm)',fontSize:'.9rem',margin:'0 0 .25rem' }}>{t('verifySub')}</p>
        <p style={{ color:'var(--cr)',fontWeight:600,fontSize:'.9rem',margin:'0 0 2rem' }}>{user?.email}</p>

        {/* 6-digit boxes */}
        <div style={{ display:'flex',gap:'.5rem',justifyContent:'center',marginBottom:'1.5rem',direction:'ltr' }}>
          {digits.map((d,idx) => (
            <input key={idx} ref={el=>refs.current[idx]=el} type="text" inputMode="numeric" maxLength={1} value={d}
              onChange={e=>handleDigit(idx,e.target.value)} onKeyDown={e=>handleKey(idx,e)}
              onPaste={idx===0?handlePaste:undefined}
              style={{ width:48,height:58,textAlign:'center',fontSize:'1.5rem',fontWeight:700,background:d?'rgba(229,9,20,.1)':'var(--cd3)',border:`2px solid ${d?'var(--cr)':'var(--cb)'}`,borderRadius:10,color:'var(--ct)',outline:'none',transition:'all .15s',caretColor:'var(--cr)' }}
            />
          ))}
        </div>

        <button className="btn-primary" onClick={verify} disabled={loading||code.length<6} style={{ width:'100%',justifyContent:'center',padding:'.85rem',fontSize:'1rem',marginBottom:'1rem' }}>
          {loading?<span style={{ display:'flex',alignItems:'center',gap:'.5rem' }}><span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block' }}/>{t('verifying')}</span>:t('verifyBtn')}
        </button>

        <p style={{ color:'var(--cm)',fontSize:'.85rem',margin:'0 0 .25rem' }}>{t('checkSpam')}</p>
        <button onClick={resend} disabled={!canResend} style={{ background:'none',border:'none',cursor:canResend?'pointer':'default',color:canResend?'var(--cr)':'var(--cm)',fontSize:'.875rem',fontWeight:600,padding:0 }}>
          {canResend?t('resendCode'):`${t('resendIn')} ${countdown}s`}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
export default EmailVerificationPage;
