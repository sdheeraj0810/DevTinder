const socket= require("socket.io");

const initSocket=(server)=>{
    const io =socket(server,{
        cors: {
            origin:"http://localhost:5173",
        }
    });
    io.on("connection",(socket)=>{
        socket.on("joinChat",({loggedInUserId,id})=>{
            const room=[loggedInUserId,id].sort().join("_");
            console.log("Joining room "+room);
            socket.join(room);
        });
        socket.on("sendMessage",({firstName,loggedInUserId,id,text})=>{
            const room=[loggedInUserId,id].sort().join("_");
            io.to(room).emit("messageRecieved",{firstName,loggedInUserId,text}); // send message to room            
        });
        socket.on("disconnect",()=>{
            
        });
    });
};

module.exports=initSocket;