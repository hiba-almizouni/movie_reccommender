import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesAPI, reviewsAPI, favoritesAPI, historyAPI, tmdbImage, tmdbBackdrop } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/ui/StarRating';
import MovieRow from '../components/movies/MovieRow';
import toast from 'react-hot-toast';

const CERT_COLORS = { 'G':'#22c55e','PG':'#84cc16','PG-13':'#f59e0b','R':'#ef4444','NC-17':'#dc2626' };

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isChild } = useAuth();
  const [movie, setMovie]         = useState(null);
  const [reviews, setReviews]     = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isFav, setIsFav]         = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchMovie = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await moviesAPI.getMovie(id);
      setMovie(data);
      if (user) {
        historyAPI.add({ movieId:data.id, movieTitle:data.title, posterPath:data.poster_path, genres:(data.genres||[]).map(g=>g.name), genreIds:(data.genres||[]).map(g=>g.id) }).catch(()=>{});
      }
    } catch { toast.error('Movie not found'); navigate('/'); }
    finally { setLoading(false); }
  }, [id, user, navigate]);

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await reviewsAPI.getForMovie(id);
      setReviews(data.reviews||[]); setAvgRating(data.averageRating);
      const mine = (data.reviews||[]).find(r=>r.user?._id===user?._id);
      if (mine) { setUserRating(mine.rating); setReviewText(mine.review||''); }
    } catch {}
  }, [id, user]);

  const checkFav = useCallback(async () => {
    if (!user) return;
    try { const { data } = await favoritesAPI.getAll(); setIsFav((data.favorites||[]).some(f=>f.movieId===parseInt(id))); }
    catch {}
  }, [id, user]);

  useEffect(() => { fetchMovie(); fetchReviews(); checkFav(); }, [fetchMovie, fetchReviews, checkFav]);

  const toggleFav = async () => {
    if (!user) return toast.error('Please sign in to save favorites');
    try {
      if (isFav) { await favoritesAPI.remove(id); toast.success('Removed from My List'); }
      else { await favoritesAPI.add({ movieId:movie.id, movieTitle:movie.title, posterPath:movie.poster_path, voteAverage:movie.vote_average, genres:(movie.genres||[]).map(g=>g.name), genreIds:(movie.genres||[]).map(g=>g.id) }); toast.success('Added to My List ❤️'); }
      setIsFav(v=>!v);
    } catch { toast.error('Failed to update'); }
  };

  const submitReview = async () => {
    if (!user) return toast.error('Please sign in to review');
    if (!userRating) return toast.error('Please select a rating');
    setSubmitting(true);
    try {
      await reviewsAPI.create({ movieId:movie.id, movieTitle:movie.title, rating:userRating, review:reviewText });
      toast.success('Review submitted! ⭐'); fetchReviews();
    } catch (e) { toast.error(e.response?.data?.error||'Failed'); }
    finally { setSubmitting(false); }
  };

  const trailerKey = movie?.videos?.results?.find(v=>v.type==='Trailer'&&v.site==='YouTube')?.key || movie?.videos?.results?.[0]?.key;

  if (loading) return (
    <div style={{ paddingTop:80 }}>
      <div className="skeleton" style={{ height:500,borderRadius:0 }}/>
      <div style={{ padding:'2rem',maxWidth:1200,margin:'0 auto' }}>
        <div className="skeleton" style={{ height:40,width:256,marginBottom:16,borderRadius:8 }}/>
        <div className="skeleton" style={{ height:16,marginBottom:8,borderRadius:4 }}/>
        <div className="skeleton" style={{ height:16,width:'75%',borderRadius:4 }}/>
      </div>
    </div>
  );
  if (!movie) return null;

  const cert = movie.certification;
  const certColor = CERT_COLORS[cert] || 'rgba(255,255,255,.3)';
  const backdrop = tmdbBackdrop(movie.backdrop_path);
  const poster   = tmdbImage(movie.poster_path,'w500');

  return (
    <div style={{ minHeight:'100vh',paddingTop:64 }} className="page-enter">
      {/* Backdrop */}
      {backdrop&&<div style={{ position:'relative',width:'100%',height:'clamp(300px,50vh,600px)',backgroundImage:`url(${backdrop})`,backgroundSize:'cover',backgroundPosition:'center',overflow:'hidden' }}><div style={{ position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.3) 0%,var(--cd) 100%)' }}/></div>}

      <div style={{ maxWidth:1100,margin:'0 auto',padding:'0 1.5rem 4rem' }}>
        <div style={{ display:'flex',gap:'2rem',flexWrap:'wrap',marginTop:backdrop?'-8rem':'2rem',position:'relative',zIndex:2 }}>
          {/* Poster */}
          <div style={{ flexShrink:0 }}>
            {poster
              ? <img src={poster} alt={movie.title} style={{ width:'clamp(160px,20vw,260px)',borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,.7)',display:'block' }} onError={e=>e.target.style.display='none'}/>
              : <div style={{ width:220,height:330,borderRadius:12,background:'linear-gradient(135deg,#1a0a0f,#0a0a1a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem' }}>🎬</div>
            }
          </div>
          {/* Info */}
          <div style={{ flex:1,minWidth:280 }}>
            <h1 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'clamp(1.8rem,4vw,3.5rem)',margin:'0 0 .5rem',color:'var(--ct)' }}>{movie.title}</h1>
            {/* Age cert badge */}
            {cert && (
              <div style={{ marginBottom:'.75rem' }}>
                <span style={{ display:'inline-flex',alignItems:'center',gap:5,background:`${certColor}22`,border:`1px solid ${certColor}66`,borderRadius:8,padding:'4px 12px',fontSize:'.82rem',fontWeight:700,color:certColor }}>
                  🔞 Rated {cert}
                  {cert==='G'&&' — All ages'}{cert==='PG'&&' — Parental guidance'}{cert==='PG-13'&&' — 13+ years'}{cert==='R'&&' — 17+ years'}{cert==='NC-17'&&' — Adults only'}
                </span>
              </div>
            )}
            <div style={{ display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1rem',flexWrap:'wrap' }}>
              {movie.vote_average>0&&<span style={{ color:'#f5c518',fontWeight:700,fontSize:'1.1rem' }}>★ {movie.vote_average.toFixed(1)}</span>}
              {avgRating&&<span style={{ color:'var(--cm)',fontSize:'.85rem' }}>({avgRating} user avg)</span>}
              {movie.release_date&&<span style={{ color:'var(--cm)',fontSize:'.85rem' }}>{movie.release_date.slice(0,4)}</span>}
              {movie.runtime>0&&<span style={{ color:'var(--cm)',fontSize:'.85rem' }}>{movie.runtime} min</span>}
            </div>
            {movie.genres?.length>0&&(
              <div style={{ display:'flex',gap:'.4rem',flexWrap:'wrap',marginBottom:'1rem' }}>
                {movie.genres.map(g=><span key={g.id} className="badge" style={{ cursor:'pointer' }} onClick={()=>navigate(`/search?genre=${g.id}`)}>{g.name}</span>)}
              </div>
            )}
            {movie.overview&&<p style={{ color:'var(--cm)',lineHeight:1.7,fontSize:'.95rem',marginBottom:'1.5rem',maxWidth:600 }}>{movie.overview}</p>}
            <div style={{ display:'flex',gap:'.75rem',flexWrap:'wrap' }}>
              {trailerKey&&!isChild&&<button className="btn-primary" onClick={()=>setTrailerOpen(true)}>▶ Watch Trailer</button>}
              <button className={isFav?'btn-primary':'btn-ghost'} onClick={toggleFav} style={isFav?{background:'rgba(229,9,20,.2)',color:'#ff6060',border:'1px solid rgba(229,9,20,.4)'}:{}}>{isFav?'❤️ Saved':'🤍 Save to List'}</button>
              <button className="btn-ghost" onClick={()=>navigate(-1)}>← Back</button>
            </div>
            {movie.credits?.cast?.length>0&&<div style={{ marginTop:'1.5rem' }}><h3 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'1.1rem',margin:'0 0 .5rem',color:'var(--ct)' }}>Cast</h3><p style={{ color:'var(--cm)',fontSize:'.85rem',margin:0 }}>{movie.credits.cast.slice(0,6).map(c=>c.name).join(', ')}</p></div>}
          </div>
        </div>

        {/* Reviews */}
        {!isChild&&(
          <div style={{ marginTop:'3rem' }}>
            <h2 style={{ fontFamily:'Bebas Neue,sans-serif',fontSize:'1.8rem',marginBottom:'1.5rem',color:'var(--ct)' }}>Reviews & Ratings</h2>
            {user&&(
              <div className="cinema-card" style={{ padding:'1.5rem',marginBottom:'2rem' }}>
                <h3 style={{ fontFamily:'DM Sans,sans-serif',fontWeight:700,margin:'0 0 1rem',fontSize:'1rem',color:'var(--ct)' }}>{userRating?'Update Your Review':'Rate This Movie'}</h3>
                <StarRating rating={userRating} onRate={setUserRating} size="lg"/>
                <textarea value={reviewText} onChange={e=>setReviewText(e.target.value)} placeholder="Share your thoughts… (optional)" className="cinema-input" style={{ marginTop:'1rem',minHeight:90,resize:'vertical' }} maxLength={1000}/>
                <div style={{ display:'flex',justifyContent:'flex-end',marginTop:'.75rem' }}>
                  <button className="btn-primary" onClick={submitReview} disabled={submitting||!userRating}>{submitting?'Submitting…':'⭐ Submit Review'}</button>
                </div>
              </div>
            )}
            <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
              {reviews.length===0?<p style={{ color:'var(--cm)',fontSize:'.9rem' }}>No reviews yet. Be the first!</p>:reviews.map(r=>(
                <div key={r._id} className="cinema-card" style={{ padding:'1.25rem' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:'.75rem',marginBottom:'.5rem' }}>
                    <span style={{ fontSize:'1.3rem' }}>👤</span>
                    <div>
                      <p style={{ margin:0,fontWeight:600,fontSize:'.9rem',color:'var(--ct)' }}>{r.user?.username||'User'}</p>
                      <StarRating rating={r.rating} readonly size="sm"/>
                    </div>
                    <span style={{ marginLeft:'auto',fontSize:'.75rem',color:'var(--cm)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.review&&<p style={{ margin:0,color:'var(--cm)',fontSize:'.9rem',lineHeight:1.6 }}>{r.review}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar */}
        {movie.similar?.results?.length>0&&<div style={{ marginTop:'3rem' }}><MovieRow title="Similar Movies" movies={movie.similar.results}/></div>}
      </div>

      {/* Trailer modal */}
      {trailerOpen&&trailerKey&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.9)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center' }} onClick={()=>setTrailerOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ width:'90vw',maxWidth:900,position:'relative' }}>
            <button onClick={()=>setTrailerOpen(false)} style={{ position:'absolute',top:-40,right:0,background:'none',border:'none',color:'white',fontSize:'1.5rem',cursor:'pointer' }}>✕ Close</button>
            <div style={{ position:'relative',paddingBottom:'56.25%',height:0 }}>
              <iframe src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',borderRadius:12,border:'none' }} allow="autoplay;fullscreen" title="Trailer"/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MovieDetailPage;
