const express = require("express");
const userModel = require("../models/user.js");
const { userAuth } = require("../utils/auth");
const { getErrorMessage } = require("../utils/validate.js");
const bcrypt= require("bcrypt");
const profileRouter=express.Router();

profileRouter.get("/profile",userAuth,async (req,res)=>{
    try {
        const user=req.user;
        if(user) {
            res.send(user);
        }
        else {
            res.status(404).send("Profile not found.");
        }
    }
    catch (err) {
        const errMsg=getErrorMessage(err); 
        res.status(400).send("Something went wrong, Error: "+errMsg);
    }
});

profileRouter.patch("/profile/edit",userAuth,async (req,res)=>{
    try {
        const data = req.body;  
        const allowedUpdates=['firstName','lastName','age','gender','skills','photoUrl','about'];
        const isAllowed=Object.keys(data).every((key)=>
            allowedUpdates.includes(key)
        );
        if(!isAllowed) {
            throw new Error("Updated on these files not allowed.");
        }
        if(data?.skills?.length>10){
            throw new Error("Skills cannot be more than 10.");
        }
        const loggedInUser=req.user;
        Object.keys(req.body).every((key)=>
            loggedInUser[key]=req.body[key]
        );
        await loggedInUser.save();
        res.json({
            message: "Profile updated successfully.",
            data:loggedInUser
        });
    }
    catch (err) {
        const errMsg=getErrorMessage(err);  //err?._message!=undefined ? err?._message : err?.errorResponse?.errmsg;
        res.status(400).send("Something went wrong, Error: "+errMsg);
    }    
});

profileRouter.patch("/profile/changepassword",userAuth,async (req,res)=>{
    try {
        const {oldPassword,newPassword}=req.body;

        if(oldPassword==newPassword){
            throw new Error("Old and new passwords cannot be same.");
        }
        const user=req.user;
        const isPasswordValid=await user.validatePassword(oldPassword);
        if(!isPasswordValid){
            throw new Error("Old password does not match.");
        }
        const newPasswordhash=await bcrypt.hash(newPassword,10);
        user.password=newPasswordhash;
        await user.save();
        res.send("Password updated successfully.");
        
    }
    catch (err) {
        const errMsg=getErrorMessage(err);  //err?._message!=undefined ? err?._message : err?.errorResponse?.errmsg;
        res.status(400).send("Something went wrong, Error: "+errMsg);
    } 
});

module.exports = profileRouter;