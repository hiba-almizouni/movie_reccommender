const r=require('express').Router();
const {optionalAuth}=require('../middleware/auth');
const {chat}=require('../controllers/chatbotController');
r.post('/',optionalAuth,chat);
module.exports=r;
