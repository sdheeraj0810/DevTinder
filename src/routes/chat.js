const express= require("express");
const { userAuth } = require("../utils/auth");
const { getErrorMessage } = require("../utils/validate");
const chatModel = require("../models/chat");

const chatRouter=express.Router();

chatRouter.post("/chats",userAuth,async (req,res)=>{
        try {
            const { id }=req.body;
            const loggedInUserId = req.user._id;

            const chats=await chatModel.findOne({
                participants:{$all:[loggedInUserId, id ]}
            }).populate({
                path:"messages.senderUserId",
                select:"firstName lastName",
            });

            //limit messages when fetching from DB

            res.json({
                message:"Chat retreived successfully.",
                data:chats
            })
        }
        catch (err) {
            const errMsg=getErrorMessage(err); 
            res.status(400).send("Something went wrong, Error: "+errMsg);
        }
});


module.exports=chatRouter;