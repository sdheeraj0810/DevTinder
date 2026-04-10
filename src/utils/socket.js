const socket= require("socket.io");
const crypto=require("crypto");
const chatModel = require("../models/chat");
const connectionRequestModel = require("../models/connectionRequest");


const getSecretRoomId=(loggedInUserId,id)=>{
 return crypto.createHash("sha256")
        .update([loggedInUserId,id].sort().join("_"))
        .digest("hex");
};

const initSocket=(server)=>{
    const io =socket(server,{
        cors: {
            origin:"http://localhost:5173",
        }
    });
    io.on("connection",(socket)=>{
        socket.on("joinChat",({loggedInUserId,id})=>{
            const securedHashRoom=getSecretRoomId(loggedInUserId,id);
            socket.join(securedHashRoom);
        }); 
           
            socket.on("sendMessage",async ({firstName,loggedInUserId,id,text})=>{
            const securedHashRoom=getSecretRoomId(loggedInUserId,id);
                try {

                    //check both are freinds or not
                    const connectionReq=connectionRequestModel.findOne({
                    $or : [
                        {fromUserId:loggedInUserId, toUserId:id, status:"accepted"},
                        {fromUserId:id, toUserId:loggedInUserId, status:"accepted"}
                    ]                       
                    });
                    if(!connectionReq)
                    {
                        throw new Exception("Not a friend")
                        return;
                    }

                    let chat= await chatModel.findOne({
                        participants:{$all:[loggedInUserId,id]}
                    });
                    if(!chat) {
                        chat=new chatModel({
                            participants:[loggedInUserId,id],
                            messages:[],
                        });
                    }
                    chat.messages.push({
                        senderUserId:loggedInUserId,
                        message:text
                    });

                    await chat.save();
                    const lastMessage = chat.messages[chat.messages.length - 1];

                    io.to(securedHashRoom).emit("messageRecieved",{firstName,loggedInUserId,text,timestamp:new Date(lastMessage.createdAt).toLocaleTimeString()}); // send message to room  
                    
            
                }   
                catch(err) {
                    console.log(err);
                }
            });
            socket.on("disconnect",()=>{
            
        });
    });
};

module.exports=initSocket;