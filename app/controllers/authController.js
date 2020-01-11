const express= require('express');
const bcrypt= require('bcryptjs');
const jwt=require('jsonwebtoken');

const authConfig= require('../../config/auth');
const User= require('../models/user');
const router= express.Router();

router.post('/register',async(req,res)=>{
    const{userName} = req.body;
    try{
        if(await User.findOne({userName}))
            return res.status(400).send({'error':'User already exists'});

        const user= await User.create(req.body);

        user.password=req.body.password;
        user.lastToken=generateToken({'id':user.id});    
        await user.save();
        user.password=undefined;
        
        return res.send({user,token:user.lastToken});
    }
    catch{
        return res.status(400).send({error:'Registration failed'});
    }
});

router.post('/authenticate',async(req,res)=>{
    const { userName, password} = req.body;

    const user= await User.findOne({userName}).select('+password');

    if(!user)
        return res.status(400).send({'error':'user not found'});
    
    if(!await bcrypt.compare(password, user.password))     
        return res.status(400).send({'error':'Invalid password'});

    user.password=password;
    user.lastToken=generateToken({'id':user.id});
    await user.save();
    user.password=undefined;

    res.send({user,token:user.lastToken});
});

module.exports=(app)=>app.use('/auth',router);

function generateToken(params={}){
    return jwt.sign({params}, authConfig.secret,{expiresIn: 720000});
}