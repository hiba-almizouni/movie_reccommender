import React from 'react';
import { useNavigate } from 'react-router-dom';
const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',textAlign:'center',padding:'2rem' }} className="page-enter">
      <div style={{ fontSize:'5rem',marginBottom:'1rem',animation:'float 3s ease-in-out infinite' }}>🎬</div>
      <h1 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(4rem,12vw,8rem)',margin:0,lineHeight:1,color:'var(--ct)' }}>404</h1>
      <p style={{ fontSize:'1.2rem',color:'var(--cm)',margin:'.5rem 0 2rem' }}>This scene doesn't exist</p>
      <div style={{ display:'flex',gap:'.75rem' }}>
        <button className="btn-primary" onClick={()=>navigate('/')}>🏠 Go Home</button>
        <button className="btn-ghost"   onClick={()=>navigate(-1)}>← Go Back</button>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}`}</style>
    </div>
  );
};
export default NotFoundPage;
