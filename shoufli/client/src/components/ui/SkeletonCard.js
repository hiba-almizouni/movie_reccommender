import React from 'react';
const SkeletonCard = () => (
  <div style={{ width:160, flexShrink:0 }}>
    <div className="skeleton" style={{ width:160, height:240, borderRadius:10 }}/>
    <div style={{ padding:'8px 4px', display:'flex', flexDirection:'column', gap:5 }}>
      <div className="skeleton" style={{ height:11, width:'75%', borderRadius:4 }}/>
      <div className="skeleton" style={{ height:10, width:'50%', borderRadius:4 }}/>
    </div>
  </div>
);
export const SkeletonRow = ({ count=6 }) => (
  <div className="movie-row-scroll" style={{ padding:'4px 0' }}>
    {Array(count).fill(0).map((_,i) => <SkeletonCard key={i}/>)}
  </div>
);
export default SkeletonCard;
