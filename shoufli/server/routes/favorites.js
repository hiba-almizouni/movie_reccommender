const r=require('express').Router();
const {protect}=require('../middleware/auth');
const c=require('../controllers/favoritesController');
r.use(protect);r.post('/',c.addFavorite);r.delete('/:movieId',c.removeFavorite);r.get('/',c.getFavorites);
module.exports=r;
