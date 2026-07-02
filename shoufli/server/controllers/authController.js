const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const safe = u => ({ _id:u._id,username:u.username,email:u.email,age:u.age,role:u.role,
  isParent:u.isParent,favoriteGenres:u.favoriteGenres,avatar:u.avatar,theme:u.theme,
  lang:u.lang,isEmailVerified:u.isEmailVerified });

const register = async (req,res) => {
  const { username,email,password,age,favoriteGenres,isParent,parentalPin,lang } = req.body;
  try {
    if (await User.findOne({ $or:[{email},{username}] }))
      return res.status(400).json({ error:'Username or email already exists' });
    const user = new User({ username,email,password,age,favoriteGenres:favoriteGenres||[],
      isParent:isParent||false,role:isParent?'parent':'user',
      parentalPin:isParent&&parentalPin?parentalPin:undefined,lang:lang||'en' });
    const code = user.generateVerifyCode();
    await user.save();
    try { await sendVerificationEmail(email, code, lang||'en'); } catch(e){ console.error('Email err:',e.message); }
    res.status(201).json({ token:generateToken(user._id), user:safe(user), requiresVerification:true });
  } catch(e){ res.status(500).json({ error:e.message||'Registration failed' }); }
};

const login = async (req,res) => {
  const { email,password } = req.body;
  if (!email||!password) return res.status(400).json({ error:'Email and password required' });
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user||!(await user.matchPassword(password))) return res.status(401).json({ error:'Invalid credentials' });
    res.json({ token:generateToken(user._id), user:safe(user) });
  } catch(e){ res.status(500).json({ error:'Login failed' }); }
};

const getMe = (req,res) => res.json({ user:safe(req.user) });
const updateTheme = async (req,res) => { await User.findByIdAndUpdate(req.user._id,{theme:req.body.theme}); res.json({theme:req.body.theme}); };
const updateLang  = async (req,res) => {
  const {lang}=req.body;
  if (!['en','fr','tn'].includes(lang)) return res.status(400).json({error:'Invalid lang'});
  await User.findByIdAndUpdate(req.user._id,{lang}); res.json({lang});
};

const verifyEmail = async (req,res) => {
  try {
    const user = await User.findById(req.user._id).select('+emailVerifyCode +emailVerifyExpires');
    if (!user.emailVerifyCode) return res.status(400).json({error:'No pending verification'});
    if (Date.now()>user.emailVerifyExpires) return res.status(400).json({error:'Code expired. Request a new one.'});
    if (user.emailVerifyCode!==req.body.code) return res.status(400).json({error:'Invalid code'});
    user.isEmailVerified=true; user.emailVerifyCode=undefined; user.emailVerifyExpires=undefined;
    await user.save();
    res.json({verified:true,message:'Email verified!'});
  } catch(e){ res.status(500).json({error:'Verification failed'}); }
};

const resendVerification = async (req,res) => {
  try {
    const user = await User.findById(req.user._id).select('+emailVerifyCode +emailVerifyExpires');
    if (user.isEmailVerified) return res.status(400).json({error:'Already verified'});
    const code = user.generateVerifyCode(); await user.save();
    await sendVerificationEmail(user.email, code, user.lang||'en');
    res.json({message:'New code sent!'});
  } catch(e){ res.status(500).json({error:'Failed to resend'}); }
};

const forgotPassword = async (req,res) => {
  const {email,lang} = req.body;
  if (!email) return res.status(400).json({error:'Email required'});
  try {
    const user = await User.findOne({email});
    if (!user) return res.json({message:'If that email exists, a reset link was sent.'});
    const token = user.generatePasswordResetToken(); await user.save();
    await sendPasswordResetEmail(email, token, lang||user.lang||'en');
    res.json({message:'Reset link sent!'});
  } catch(e){ res.status(500).json({error:'Failed to send reset email'}); }
};

const resetPassword = async (req,res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  try {
    const user = await User.findOne({passwordResetToken:hashed,passwordResetExpires:{$gt:Date.now()}})
      .select('+passwordResetToken +passwordResetExpires');
    if (!user) return res.status(400).json({error:'Token invalid or expired'});
    const {password} = req.body;
    if (!password||password.length<6) return res.status(400).json({error:'Password min 6 chars'});
    user.password=password; user.passwordResetToken=undefined; user.passwordResetExpires=undefined;
    await user.save();
    res.json({message:'Password reset successfully!'});
  } catch(e){ res.status(500).json({error:'Reset failed'}); }
};

const verifyPin = async (req,res) => {
  try {
    const user = await User.findById(req.user._id).select('+parentalPin');
    if (!user.parentalPin) return res.status(400).json({error:'No PIN set'});
    res.json({valid:await user.matchPin(req.body.pin)});
  } catch(e){ res.status(500).json({error:'PIN check failed'}); }
};

module.exports = {register,login,getMe,updateTheme,updateLang,verifyEmail,resendVerification,forgotPassword,resetPassword,verifyPin};
