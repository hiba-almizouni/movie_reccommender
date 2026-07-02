const r=require('express').Router();
const {optionalAuth}=require('../middleware/auth');
const c=require('../controllers/moviesController');
r.get('/genres',c.getGenres);
r.get('/search',optionalAuth,c.searchMovies);
r.get('/',optionalAuth,c.getMovies);
r.get('/:id',optionalAuth,c.getMovieById);
module.exports=r;
