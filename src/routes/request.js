const express = require("express");
const { userAuth } = require("../utils/auth");
const connectionRequestModel = require("../models/connectionRequest");
const { getErrorMessage } = require("../utils/validate");
const userModel = require("../models/user");
const requestRouter=express.Router();

requestRouter.post("/request/send/:status/:toUserId",userAuth, async (req, res)=>{
    try {
        const fromUserId=req.user._id;
        const toUserId=req.params.toUserId;
        const status=req.params.status;

        const allowedStatus=["intrested","ignored"];
        if(!allowedStatus.includes(status)){
             throw new Error("Invalid status type.");
        }
        const checkToUser = userModel.findById(toUserId);
        if(!checkToUser){
            throw new Error("User not found.");
        }        
        // const requestDB=await connectionRequestModel.findOne({
        //     $or:[
        //         {fromUserId:fromUserId,toUserId:toUserId},
        //         {fromUserId:toUserId,toUserId:fromUserId}
        //     ]
        // });
        const requestDB=await connectionRequestModel.findOne({fromUserId:fromUserId,toUserId:toUserId});
        if(requestDB){
            throw new Error("Request already present.");
        }
        const requestDBReverse=await connectionRequestModel.findOne({fromUserId:toUserId,toUserId:fromUserId});
        if(requestDBReverse)
            { 
             // match scenario
             if(requestDBReverse.status=="accepted") {
                throw new Error("Profile already matched.");
             }
             requestDBReverse.status="accepted";
             await requestDBReverse.save();
             res.json({
                message:"Connection request send successfully. Its a match",
                data:requestDBReverse
            });
        }
        else {
            const connectionRequest = new connectionRequestModel({
                fromUserId:fromUserId,
                toUserId:toUserId,
                status:status
            });
            const data = await connectionRequest.save();
            res.json({
                message:"Connection request send successfully.",
                data
            });
        }
    }
    catch (err) {
        const errMsg=getErrorMessage(err); 
        res.status(400).send("Something went wrong, Error: " + errMsg);
    }
});

requestRouter.post("/request/review/:status/:requestId",userAuth,async (req,res)=> {
    try{  
        const {status , requestId } =req.params;
        const loggedInUser=req.user;

        const allowedStatus=["accepted","rejected"];
        if(!allowedStatus.includes(status)){
             throw new Error("Invalid status type.");
        }
        const requestDB = await connectionRequestModel.findOne({
            _id:requestId,
            status:"intrested",
            toUserId:loggedInUser._id
        });
        if(!requestDB) {
            res.status(404).json({
                message:"Invaid request."                
            });
        }
        requestDB.status=status;
        const data=await requestDB.save();
        res.json({
                message:"Connection request " + status + ".",
                data:data
            });


    }
    catch (err) {

    }

});

module.exports = requestRouter;