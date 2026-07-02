import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { authAPI } from '../services/api';
import LangSwitcher from '../components/ui/LangSwitcher';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate  = useNavigate();
  const { t, isRTL } = useLang();
  const [form, setForm] = useState({ password:'', confirm:'' });
  const [show, setShow] = useState({ password:false, confirm:false });
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (form.password.length<6) return toast.error('Password: min 6 characters');
    if (form.password!==form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      setDone(true);
      toast.success('Password reset! You can now sign in.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Link expired. Please request a new one.');
    } finally { setLoading(false); }
  };

  const strength = pw => pw.length>=10?'strong':pw.length>=6?'medium':'weak';
  const strengthColors = { strong:'#22c55e', medium:'#f59e0b', weak:'#ef4444' };
  const strengthWidths = { strong:'100%', medium:'60%', weak:'25%' };

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cd)',backgroundImage:'radial-gradient(ellipse 80% 60% at 50% -20%,rgba(229,9,20,.1) 0%,transparent 60%)',padding:'1rem' }}>
      <div style={{ position:'fixed',top:'1rem',right:'1rem' }}><LangSwitcher/></div>
      <div className="cinema-card page-enter" style={{ width:'100%',maxWidth:420,padding:'2.5rem 2rem' }}>
        <div style={{ textAlign:'center',marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.5rem',marginBottom:'.5rem' }}>{done?'✅':'🔒'}</div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'2rem',margin:'0 0 .5rem',color:'var(--ct)' }}>{done?'Done!':t('resetPasswordTitle')}</h1>
          <p style={{ color:'var(--cm)',fontSize:'.875rem',margin:0 }}>{done?(isRTL?'جاري التحويل…':'Redirecting to login…'):isRTL?'اختر كلمة سر قوية':'Choose a strong password'}</p>
        </div>

        {done?(
          <div style={{ textAlign:'center' }}>
            <div style={{ background:'rgba(34,197,94,.1)',border:'1px solid rgba(34,197,94,.3)',borderRadius:10,padding:'1rem',marginBottom:'1.5rem' }}>
              <p style={{ color:'#86efac',margin:0,fontSize:'.875rem' }}>Password reset successfully! You can now sign in.</p>
            </div>
            <Link to="/login" className="btn-primary" style={{ textDecoration:'none',display:'inline-flex',justifyContent:'center',width:'100%',padding:'.85rem' }}>{t('signIn')}</Link>
          </div>
        ):(
          <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
            {[['password',t('newPwLabel'),t('newPwPh')],['confirm',t('confirmNewLabel'),t('newPwPh')]].map(([key,label,ph])=>(
              <div key={key}>
                <label style={{ display:'block',marginBottom:'.4rem',fontSize:'.85rem',fontWeight:600,color:'var(--ct)' }}>{label}</label>
                <div style={{ position:'relative' }}>
                  <input type={show[key]?'text':'password'} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph} className="cinema-input" style={{ paddingRight:'2.5rem',textAlign:isRTL?'right':'left' }} required/>
                  <button type="button" onClick={()=>setShow(s=>({...s,[key]:!s[key]}))} style={{ position:'absolute',right:'.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--cm)',fontSize:'1rem' }}>{show[key]?'🙈':'👁'}</button>
                </div>
              </div>
            ))}
            {/* Strength bar */}
            {form.password&&(
              <div>
                <div style={{ height:4,borderRadius:2,background:'var(--cd4)',overflow:'hidden' }}>
                  <div style={{ height:'100%',borderRadius:2,transition:'width .3s,background .3s',width:strengthWidths[strength(form.password)],background:strengthColors[strength(form.password)] }}/>
                </div>
                <p style={{ margin:'4px 0 0',fontSize:'.75rem',color:strengthColors[strength(form.password)] }}>
                  {strength(form.password)==='strong'?'Strong 💪':strength(form.password)==='medium'?'Medium':'Weak'}
                </p>
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={loading} style={{ width:'100%',justifyContent:'center',padding:'.85rem',fontSize:'1rem' }}>
              {loading?<span style={{ display:'flex',alignItems:'center',gap:'.5rem' }}><span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block' }}/>{t('resetting')}</span>:t('resetBtn')}
            </button>
            <div style={{ textAlign:'center' }}><Link to="/login" style={{ color:'var(--cm)',fontSize:'.85rem',textDecoration:'none' }}>{t('backToLogin')}</Link></div>
          </form>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
export default ResetPasswordPage;
