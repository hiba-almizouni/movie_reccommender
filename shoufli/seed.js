require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username:String,email:String,password:String,age:Number,role:String,
  isParent:Boolean,favoriteGenres:[String],avatar:String,theme:String,lang:String,isEmailVerified:Boolean,
});
userSchema.pre('save',async function(n){if(!this.isModified('password'))return n();this.password=await bcrypt.hash(this.password,12);n();});
const User = mongoose.model('User',userSchema);

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI||'mongodb://localhost:27017/shoufli');
  console.log('✅ Connected');
  await User.deleteMany({ email:{$in:['parent@shoufli.movie','user@shoufli.movie']} });

  await User.create({ username:'ShoufliParent',email:'parent@shoufli.movie',password:'password123',age:35,role:'parent',isParent:true,favoriteGenres:['Drama','Thriller'],avatar:'👨',theme:'dark',lang:'en',isEmailVerified:true });
  console.log('👨 parent@shoufli.movie / password123');

  await User.create({ username:'MovieFan',email:'user@shoufli.movie',password:'password123',age:25,role:'user',isParent:false,favoriteGenres:['Action','Sci-Fi','Comedy'],avatar:'🎬',theme:'dark',lang:'en',isEmailVerified:true });
  console.log('👤 user@shoufli.movie   / password123');

  console.log('\n✅ Done!\n');
  process.exit(0);
};

seed().catch(e=>{ console.error(e); process.exit(1); });
