const mongoose = require('../../database');
const bcrypt= require("bcryptjs");

const UserSchema = new mongoose.Schema({
    password:{
        type:String,
        required: true,
        select: false
    },
    userName:{
        type: String,
        unique: true,
        required:true,
        select: false
    },
    lastToken:{
        type:String,
        required:false,
        default:0
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function(next){
    const hash= await bcrypt.hash(this.password,10);
    this.password=hash;
    next();
});

const User = mongoose.model('User', UserSchema);
module.exports=User;