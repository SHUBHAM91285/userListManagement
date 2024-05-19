const express = require('express');
const router = express.Router();
const User = require('./../models/user');

router.get('/users',async(req,res)=>{
    try{
        const users = await User.find()
        const usersRecord = users.map((data)=>{
            return{
                name: data.name,
                email: data.email,
                city: data.city
            }
        })
        return res.status(200).json(usersRecord)
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server error"});
    }
})

module.exports = router;