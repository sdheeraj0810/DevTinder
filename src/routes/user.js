const express = require("express");
const {userAuth} = require("../utils/auth");
const { getErrorMessage } = require("../utils/validate");
const connectionRequestModel = require("../models/connectionrequest");
const userModel = require("../models/user");
const userRouter=express.Router();

const USER_SAFE_DATA=["firstName","lastName","age","photoUrl","about","skills"];

userRouter.get("/user/requests/:status",userAuth,async (req,res)=>{
    try {
        const user=req.user;
        const status=req.params.status;
        const connRequests= await connectionRequestModel.find({
            toUserId:user._id,
            status:status
        }).populate("fromUserId",USER_SAFE_DATA);

        res.json({
            message:"Requests fetched successfully.",
            data:connRequests
        });
    }
    catch (err) {
        const errMsg=getErrorMessage(err);
        throw new Error(errMsg);
    }
});

userRouter.get("/user/connections",userAuth,async (req,res)=>{
    try{
        const user=req.user;
        const connRequests=await connectionRequestModel.find({
            $or : [
                {fromUserId:user._id, status:"accepted"},
                {toUserId:user._id, status:"accepted"}
            ]
        }).populate("fromUserId",USER_SAFE_DATA)
        .populate("toUserId",USER_SAFE_DATA);

        const data=connRequests.map((row)=> 
        {
            if(row.fromUserId._id.toString()==user._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        }
    );
        res.json({
            message:"User connections fetched.",
            data:data
        });
    }
    catch(err) {
        const errMsg=getErrorMessage(err);
        res.status(400).send("Something went wrong, Error: ",errMsg);
    }
});

userRouter.get("/user/feed",userAuth,async (req,res)=>{
    try{
        const loggedInUser=req.user;

        const page=parseInt(req.query.page) || 1;
        let limit=parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;

        const connRequests=await connectionRequestModel.find({
            $or : [
                {fromUserId:loggedInUser._id},
                {toUserId:loggedInUser._id}
            ]
        }).select("fromUserId toUserId");
        const hiddenUsers=new Set();
        connRequests.forEach(element => {
            hiddenUsers.add(element.fromUserId.toString());
            hiddenUsers.add(element.toUserId.toString());
        });

        const skipNo=(page-1)*limit;

        const users=await userModel.find({
            _id: {$nin: Array.from(hiddenUsers) }
        }).select(USER_SAFE_DATA).skip(skipNo).limit(limit);
        res.send(users);
    }
    catch (err) {
        const errMsg=getErrorMessage(err);
        res.status(400).send("Something went wrong, Error:",errMsg);
    }
});

module.exports=userRouter;