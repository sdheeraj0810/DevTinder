const express = require("express");
const app = express();
app.use("/test",(req,res)=>{
    res.send("Test from server");
});
app.get("/user/:userid",(req,res)=>{
    console.log(req.params);
    res.send({firstname:"Dheeraj",lastname:"Sawlani"});
});
app.post("/user",(req,res)=>{
    res.send("Data saved.");
});
// app.use("/",(req,res)=>{
//     res.send("Hello from server");
// });
// this order is important, because whatever matches first gets executed
app.listen(3000,()=>{
    console.log('Server started successfully.');
});
