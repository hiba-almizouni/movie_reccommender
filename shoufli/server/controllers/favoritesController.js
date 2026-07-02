const { Favorite, WatchHistory } = require('../models/Favorites');

const addFavorite = async (req,res) => {
  const { movieId,movieTitle,posterPath,voteAverage,genres,genreIds } = req.body;
  try {
    const fav = await Favorite.findOneAndUpdate(
      {user:req.user._id,movieId},
      {user:req.user._id,movieId,movieTitle,posterPath,voteAverage,genres:genres||[],genreIds:genreIds||[]},
      {upsert:true,new:true}
    );
    res.json({favorite:fav,message:'Added to favorites'});
  } catch(e){ res.status(500).json({error:'Failed to add favorite'}); }
};

const removeFavorite = async (req,res) => {
  try {
    await Favorite.findOneAndDelete({user:req.user._id,movieId:parseInt(req.params.movieId)});
    res.json({message:'Removed from favorites'});
  } catch(e){ res.status(500).json({error:'Failed to remove'}); }
};

const getFavorites = async (req,res) => {
  try {
    const favorites = await Favorite.find({user:req.user._id}).sort({addedAt:-1});
    res.json({favorites});
  } catch(e){ res.status(500).json({error:'Failed to fetch favorites'}); }
};

const addToHistory = async (req,res) => {
  const {movieId,movieTitle,posterPath,genres,genreIds} = req.body;
  try {
    await WatchHistory.findOneAndUpdate(
      {user:req.user._id,movieId},
      {user:req.user._id,movieId,movieTitle,posterPath,genres:genres||[],genreIds:genreIds||[],watchedAt:new Date()},
      {upsert:true,new:true}
    );
    res.json({message:'History updated'});
  } catch(e){ res.status(500).json({error:'Failed to update history'}); }
};

const getWatchHistory = async (req,res) => {
  try {
    const history = await WatchHistory.find({user:req.user._id}).sort({watchedAt:-1}).limit(50);
    res.json({history});
  } catch(e){ res.status(500).json({error:'Failed to fetch history'}); }
};

module.exports = {addFavorite,removeFavorite,getFavorites,addToHistory,getWatchHistory};
