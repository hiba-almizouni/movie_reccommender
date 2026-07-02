import React, { useState } from 'react';
const StarRating = ({ rating=0, onRate, readonly=false, size='md' }) => {
  const [hover, setHover] = useState(0);
  const fs = size==='sm'?'1rem':size==='lg'?'1.9rem':'1.4rem';
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s}
          style={{ fontSize:fs, color:s<=(hover||rating)?'#f5c518':'var(--cm)', cursor:readonly?'default':'pointer', transition:'color .1s' }}
          onClick={() => !readonly && onRate && onRate(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}>★</span>
      ))}
    </div>
  );
};
export default StarRating;
