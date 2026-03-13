const express = require("express");
const authRouter=express.Router();

const bcrypt= require("bcrypt");
const userModel = require("../models/user.js");
const { userAuth } = require("../utils/auth");
const { getErrorMessage } = require("../utils/validate.js");
const cookieParser=require("cookie-parser");


authRouter.post("/signup",async (req,res)=>{    
    const {firstName,lastName,emailId,password}=req.body;
    const passwordhash=await bcrypt.hash(password,10);
    const user=new userModel(
        {
            firstName:firstName,
            lastName:lastName,
            emailId:emailId,
            password:passwordhash
        }
    ); 
    try {
        await user.save();
        res.send({message:"User created successfully.", data: []});
    }
    catch (err) {
        const errMsg=getErrorMessage(err);  //err?._message!=undefined ? err?._message : err?.errorResponse?.errmsg;
        res.status(400).send("User creation failed, Error: " + errMsg);
    }    
});

authRouter.post("/login",async (req,res)=>{        
    try {    
        const {emailId,password}=req.body;
        const user = await userModel.findOne({emailId:emailId});
        if(!user) {
            throw new Error("Invalid credentials.");    
        }        
        const isPasswordValid=await user.validatePassword(password);
        
        if(!isPasswordValid) {
            throw new Error("Invalid credentials.");    
        }
        const token = await user.getJWT();

        res.cookie("token",token,{httpOnly:true,expires:new Date(Date.now()+360000)} );
        res.send({message:"User logged in successfully", data: user});
    }
    catch (err) {        
        const errMsg=getErrorMessage(err);  //err?._message!=undefined ? err?._message : err?.errorResponse?.errmsg;
        res.status(400).send("Login failed, Error: " + errMsg);
    }    
});

authRouter.post("/logout",async (req,res)=>{
    try {
        res.cookie("token",null,{expires:new Date(Date.now())});
        res.send("User logged out successfully");
    }
    catch (err) {
       const errMsg=getErrorMessage(err); 
        res.status(400).send("Logout failed, Error: " + errMsg); 
    }
});

module.exports = authRouter;
