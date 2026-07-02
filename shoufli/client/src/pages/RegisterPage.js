import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import LangSwitcher from '../components/ui/LangSwitcher';
import toast from 'react-hot-toast';

const GENRES = ['Action','Adventure','Animation','Comedy','Crime','Documentary','Drama','Fantasy','Horror','Mystery','Romance','Science Fiction','Thriller','Family'];

const RegisterPage = () => {
  const { register } = useAuth();
  const { t, lang, isRTL } = useLang();
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ username:'',email:'',password:'',confirmPassword:'',age:'',favoriteGenres:[],isParent:false,parentalPin:'' });

  const h = e => { const { name,value,type,checked }=e.target; setForm(f=>({...f,[name]:type==='checkbox'?checked:value})); };
  const toggleGenre = g => setForm(f=>({...f,favoriteGenres:f.favoriteGenres.includes(g)?f.favoriteGenres.filter(x=>x!==g):[...f.favoriteGenres,g]}));

  const val1 = () => {
    if (!form.username||form.username.length<3) return toast.error('Username: min 3 chars')||false;
    if (!form.email||!/\S+@\S+\.\S+/.test(form.email)) return toast.error('Invalid email')||false;
    if (!form.password||form.password.length<6) return toast.error('Password: min 6 chars')||false;
    if (form.password!==form.confirmPassword) return toast.error('Passwords do not match')||false;
    return true;
  };

  const submit = async () => {
    if (!form.age||form.age<1) return toast.error('Please enter your age');
    setLoading(true);
    try {
      await register({ username:form.username,email:form.email,password:form.password,age:parseInt(form.age),favoriteGenres:form.favoriteGenres,isParent:form.isParent,parentalPin:form.parentalPin||undefined,lang });
      navigate('/verify-email');
    } catch (err) {
      toast.error(err.response?.data?.error||'Registration failed');
    } finally { setLoading(false); }
  };

  const lbl = { display:'block',marginBottom:'.4rem',fontSize:'.85rem',fontWeight:600,color:'var(--ct)' };
  const pill = active => ({ padding:'5px 14px',borderRadius:20,fontSize:'.8rem',cursor:'pointer',border:'1px solid',background:active?'var(--cr)':'var(--cd3)',borderColor:active?'var(--cr)':'var(--cb)',color:active?'white':'var(--ct)',transition:'all .15s' });

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cd)',backgroundImage:'radial-gradient(ellipse 80% 60% at 50% -20%,rgba(229,9,20,.12) 0%,transparent 60%)',padding:'1rem',paddingTop:'5rem' }}>
      <div style={{ position:'fixed',top:'1rem',right:'1rem' }}><LangSwitcher/></div>
      <div className="cinema-card page-enter" style={{ width:'100%',maxWidth:460,padding:'2.5rem 2rem' }}>
        <div style={{ textAlign:'center',marginBottom:'1.5rem' }}>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'2rem',margin:'0 0 .2rem',color:'var(--ct)' }}>{t('registerTitle')}</h1>
          <p style={{ color:'var(--cm)',margin:0,fontSize:'.85rem' }}>{t('registerSub')}</p>
        </div>

        {/* Progress bar */}
        <div style={{ display:'flex',gap:'.5rem',marginBottom:'1.5rem' }}>
          {[1,2,3].map(s=><div key={s} style={{ flex:1,height:4,borderRadius:2,background:s<=step?'var(--cr)':'var(--cd4)',transition:'background .3s' }}/>)}
        </div>

        {step===1&&(
          <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
            <p style={{ margin:0,color:'var(--cm)',fontSize:'.85rem' }}>{t('step1')}</p>
            {[['username',t('usernameLabel'),t('usernamePh'),'text'],['email',t('emailLabel'),t('emailPh'),'email'],['password',t('passwordLabel'),t('passwordPh'),'password'],['confirmPassword',t('confirmPwLabel'),t('confirmPwPh'),'password']].map(([name,label,ph,type])=>(
              <div key={name}><label style={lbl}>{label}</label><input className="cinema-input" type={type} name={name} value={form[name]} onChange={h} placeholder={ph} style={{ textAlign:isRTL?'right':'left' }}/></div>
            ))}
            <button className="btn-primary" style={{ width:'100%',justifyContent:'center',padding:'.85rem' }} onClick={()=>val1()&&setStep(2)}>{t('nextBtn')}</button>
          </div>
        )}

        {step===2&&(
          <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
            <p style={{ margin:0,color:'var(--cm)',fontSize:'.85rem' }}>{t('step2')}</p>
            <div><label style={lbl}>{t('ageLabel')}</label><input className="cinema-input" type="number" name="age" value={form.age} onChange={h} placeholder={t('agePh')} min="1" max="120" style={{ textAlign:isRTL?'right':'left' }}/><span style={{ fontSize:'.75rem',color:'var(--cm)' }}>{t('ageSub')}</span></div>
            <div>
              <label style={lbl}>{t('genresLabel')}</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:'.4rem' }}>
                {GENRES.map(g=><button key={g} onClick={()=>toggleGenre(g)} style={pill(form.favoriteGenres.includes(g))}>{g}</button>)}
              </div>
            </div>
            <div style={{ display:'flex',gap:'.75rem' }}>
              <button className="btn-ghost" style={{ flex:1 }} onClick={()=>setStep(1)}>{t('backBtn')}</button>
              <button className="btn-primary" style={{ flex:1,justifyContent:'center' }} onClick={()=>setStep(3)}>{t('nextBtn')}</button>
            </div>
          </div>
        )}

        {step===3&&(
          <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
            <p style={{ margin:0,color:'var(--cm)',fontSize:'.85rem' }}>{t('step3')}</p>
            <div style={{ background:'var(--cd3)',borderRadius:10,padding:'1rem',border:'1px solid var(--cb)' }}>
              <label style={{ display:'flex',alignItems:'center',gap:'.75rem',cursor:'pointer',flexDirection:isRTL?'row-reverse':'row' }}>
                <input type="checkbox" name="isParent" checked={form.isParent} onChange={h} style={{ width:18,height:18,accentColor:'var(--cr)',flexShrink:0 }}/>
                <div><p style={{ margin:0,fontWeight:600,color:'var(--ct)',fontSize:'.9rem' }}>🛡 {t('isParentLabel')}</p><p style={{ margin:0,fontSize:'.78rem',color:'var(--cm)' }}>{t('isParentSub')}</p></div>
              </label>
            </div>
            {form.isParent&&<div><label style={lbl}>{t('pinLabel')}</label><input className="cinema-input" type="password" name="parentalPin" value={form.parentalPin} onChange={h} placeholder={t('pinPh')} maxLength={6} style={{ textAlign:isRTL?'right':'left' }}/></div>}
            <div style={{ background:'rgba(229,9,20,.06)',borderRadius:10,padding:'.875rem',border:'1px solid rgba(229,9,20,.15)' }}>
              <p style={{ margin:0,fontSize:'.82rem',color:'var(--cm)' }}>📧 {lang==='tn'?'بعد التسجيل راح تجيك رسالة تأكيد':lang==='fr'?"Un email de confirmation vous sera envoyé":"A verification code will be sent to your email."}</p>
            </div>
            <div style={{ display:'flex',gap:'.75rem' }}>
              <button className="btn-ghost" style={{ flex:1 }} onClick={()=>setStep(2)}>{t('backBtn')}</button>
              <button className="btn-primary" style={{ flex:1,justifyContent:'center',padding:'.85rem' }} onClick={submit} disabled={loading}>
                {loading?<span style={{ display:'flex',alignItems:'center',gap:'.5rem' }}><span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block' }}/>{t('creating')}</span>:t('createAccount')}
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop:'1.5rem',textAlign:'center',borderTop:'1px solid var(--cb)',paddingTop:'1.25rem' }}>
          <p style={{ color:'var(--cm)',fontSize:'.9rem',margin:0 }}>{t('alreadyAccount')} <Link to="/login" style={{ color:'var(--cr)',fontWeight:600,textDecoration:'none' }}>{t('signIn')}</Link></p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
export default RegisterPage;
