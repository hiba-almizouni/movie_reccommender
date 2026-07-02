const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username:  { type:String, required:true, unique:true, trim:true, minlength:3, maxlength:30 },
  email:     { type:String, required:true, unique:true, lowercase:true, trim:true },
  password:  { type:String, required:true, minlength:6, select:false },
  age:       { type:Number, required:true, min:1, max:120 },
  role:      { type:String, enum:['parent','user'], default:'user' },
  favoriteGenres: [String],
  avatar:    { type:String, default:'' },
  isParent:  { type:Boolean, default:false },
  parentalPin: { type:String, select:false },
  theme:     { type:String, enum:['dark','light'], default:'dark' },
  lang:      { type:String, enum:['en','fr','tn'], default:'en' },
  isEmailVerified:    { type:Boolean, default:false },
  emailVerifyCode:    { type:String, select:false },
  emailVerifyExpires: { type:Date, select:false },
  passwordResetToken:   { type:String, select:false },
  passwordResetExpires: { type:Date, select:false },
}, { timestamps:true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12); next();
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('parentalPin') || !this.parentalPin) return next();
  this.parentalPin = await bcrypt.hash(this.parentalPin, 10); next();
});

userSchema.methods.matchPassword = async function(pw) { return bcrypt.compare(pw, this.password); };
userSchema.methods.matchPin = async function(pin) { return bcrypt.compare(pin, this.parentalPin); };
userSchema.methods.generateVerifyCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerifyCode = code;
  this.emailVerifyExpires = Date.now() + 15 * 60 * 1000;
  return code;
};
userSchema.methods.generatePasswordResetToken = function() {
  const raw = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(raw).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  return raw;
};

module.exports = mongoose.model('User', userSchema);
