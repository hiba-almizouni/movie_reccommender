const r=require('express').Router();
const {optionalAuth}=require('../middleware/auth');
const {getRecommendations}=require('../controllers/recommendationsController');
r.get('/',optionalAuth,getRecommendations);
module.exports=r;
