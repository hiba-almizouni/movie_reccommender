import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import LangSwitcher from '../components/ui/LangSwitcher';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const { t, isRTL } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cd)',backgroundImage:'radial-gradient(ellipse 80% 60% at 50% -20%,rgba(229,9,20,.12) 0%,transparent 60%)',padding:'1rem' }}>
      <div style={{ position:'fixed',top:'1rem',right:'1rem' }}><LangSwitcher/></div>
      <div className="cinema-card page-enter" style={{ width:'100%',maxWidth:420,padding:'2.5rem 2rem' }}>
        <div style={{ textAlign:'center',marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.5rem',marginBottom:'.5rem' }}>🎬</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'2.2rem',margin:'0 0 .25rem',color:'var(--ct)',letterSpacing:'.05em' }}>Shoufli <span style={{ color:'var(--cr)' }}>Movie</span></h1>
          <p style={{ color:'var(--cm)',margin:0,fontSize:'.9rem' }}>{t('loginTitle')}</p>
        </div>
        <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
          <div>
            <label style={{ display:'block',marginBottom:'.4rem',fontSize:'.85rem',fontWeight:600,color:'var(--ct)' }}>{t('emailLabel')}</label>
            <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder={t('emailPh')} className="cinema-input" style={{ textAlign:isRTL?'right':'left' }} required/>
          </div>
          <div>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.4rem' }}>
              <label style={{ fontSize:'.85rem',fontWeight:600,color:'var(--ct)' }}>{t('passwordLabel')}</label>
              <Link to="/forgot-password" style={{ fontSize:'.78rem',color:'var(--cr)',textDecoration:'none' }}>{t('forgotPassword')}</Link>
            </div>
            <div style={{ position:'relative' }}>
              <input type={showPw?'text':'password'} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder={t('passwordPh')} className="cinema-input" style={{ paddingRight:'2.5rem',textAlign:isRTL?'right':'left' }} required/>
              <button type="button" onClick={()=>setShowPw(v=>!v)} style={{ position:'absolute',right:'.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--cm)',fontSize:'1rem' }}>{showPw?'🙈':'👁'}</button>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width:'100%',justifyContent:'center',padding:'.85rem',fontSize:'1rem',marginTop:'.25rem' }}>
            {loading?<span style={{ display:'flex',alignItems:'center',gap:'.5rem' }}><span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block' }}/>{t('loggingIn')}</span>:t('loginBtn')}
          </button>
        </form>
        <div style={{ marginTop:'1.5rem',textAlign:'center',borderTop:'1px solid var(--cb)',paddingTop:'1.25rem' }}>
          <p style={{ color:'var(--cm)',fontSize:'.9rem',margin:0 }}>{t('noAccount')} <Link to="/register" style={{ color:'var(--cr)',fontWeight:600,textDecoration:'none' }}>{t('createOne')}</Link></p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
export default LoginPage;
