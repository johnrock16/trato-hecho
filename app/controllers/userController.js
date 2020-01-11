const express= require('express');
const router= express.Router();
const middleware= require('../middleware/auth');
const User=require("../models/user");

router.use(middleware);

router.get('/',(req,res)=>{
    res.send({'ok':true, 'user':req.userId});
});

router.post('/',async(req,res)=>{
    const{_id, lastToken}=req.body;
    const user= await User.findOne({_id});
    if(lastToken!=user.lastToken){
        return res.send({'ok':false,'message':'token Expired'});
    }
    res.send({'ok':true,'message':'token is validated'});
});

module.exports= app=>app.use('/users',router);