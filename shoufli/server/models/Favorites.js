const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user:       { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  movieId:    { type:Number, required:true },
  movieTitle: String,
  posterPath: String,
  voteAverage:Number,
  genres:     [String],
  genreIds:   [Number],
  addedAt:    { type:Date, default:Date.now }
});
favoriteSchema.index({ user:1, movieId:1 }, { unique:true });

const watchHistorySchema = new mongoose.Schema({
  user:       { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  movieId:    { type:Number, required:true },
  movieTitle: String,
  posterPath: String,
  genres:     [String],
  genreIds:   [Number],
  watchedAt:  { type:Date, default:Date.now }
});
watchHistorySchema.index({ user:1, movieId:1 });

const reviewSchema = new mongoose.Schema({
  user:       { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  movieId:    { type:Number, required:true },
  movieTitle: String,
  rating:     { type:Number, required:true, min:1, max:5 },
  review:     { type:String, maxlength:1000 },
}, { timestamps:true });
reviewSchema.index({ user:1, movieId:1 }, { unique:true });

const profileSchema = new mongoose.Schema({
  owner:        { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  name:         { type:String, required:true, trim:true },
  avatar:       { type:String, default:'🎬' },
  age:          { type:Number, required:true },
  type:         { type:String, enum:['parent','child'], default:'child' },
  isChildProfile:{ type:Boolean, default:true },
  allowedGenres:[String],
  blockedGenres:[String],
  watchHistory: [{ movieId:Number, movieTitle:String, posterPath:String, watchedAt:{ type:Date, default:Date.now } }],
}, { timestamps:true });

module.exports = {
  Favorite:     mongoose.model('Favorite', favoriteSchema),
  WatchHistory: mongoose.model('WatchHistory', watchHistorySchema),
  Review:       mongoose.model('Review', reviewSchema),
  Profile:      mongoose.model('Profile', profileSchema),
};
