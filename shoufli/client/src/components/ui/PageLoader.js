import React from 'react';
const PageLoader = () => (
  <div style={{ position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cd)',zIndex:9999 }}>
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:'3rem',marginBottom:'1rem',animation:'float 2s ease-in-out infinite' }}>🎬</div>
      <p style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'1.3rem',letterSpacing:'.1em',color:'var(--cm)',margin:0 }}>Shoufli Movie</p>
    </div>
    <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
  </div>
);
export default PageLoader;
