const r=require('express').Router();
const {protect}=require('../middleware/auth');
const c=require('../controllers/favoritesController');
r.use(protect);r.post('/',c.addToHistory);r.get('/',c.getWatchHistory);
module.exports=r;
