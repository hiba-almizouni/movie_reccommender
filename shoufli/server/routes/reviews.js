const r=require('express').Router();
const {protect}=require('../middleware/auth');
const {Review}=require('../models/Favorites');
r.post('/',protect,async(req,res)=>{
  const {movieId,movieTitle,rating,review}=req.body;
  if(!movieId||!rating)return res.status(400).json({error:'movieId and rating required'});
  try{
    const ex=await Review.findOne({user:req.user._id,movieId});
    if(ex){ex.rating=rating;ex.review=review||ex.review;await ex.save();return res.json({review:ex});}
    const nr=await Review.create({user:req.user._id,movieId,movieTitle,rating,review});
    res.status(201).json({review:nr});
  }catch(e){res.status(500).json({error:'Failed'});}
});
r.get('/:movieId',async(req,res)=>{
  try{
    const reviews=await Review.find({movieId:req.params.movieId}).populate('user','username avatar').sort({createdAt:-1}).limit(20);
    const avg=reviews.length?(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1):null;
    res.json({reviews,averageRating:avg,totalReviews:reviews.length});
  }catch(e){res.status(500).json({error:'Failed'});}
});
r.delete('/:id',protect,async(req,res)=>{
  try{
    const rev=await Review.findById(req.params.id);
    if(!rev)return res.status(404).json({error:'Not found'});
    if(rev.user.toString()!==req.user._id.toString())return res.status(403).json({error:'Unauthorized'});
    await rev.deleteOne();res.json({message:'Deleted'});
  }catch(e){res.status(500).json({error:'Failed'});}
});
module.exports=r;
