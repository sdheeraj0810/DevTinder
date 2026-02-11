const express = require("express");
const { userAuth } = require("./utils/auth");
const connectDB = require("./config/database.js");
const userModel = require("./models/user.js");
const { getErrorMessage } = require("./utils/validate.js");
const app = express();
const cookieParser=require("cookie-parser");
app.use(express.json());
app.use(cookieParser());

const cors=require("cors");
app.use(cors({
    origin:"http://localhost:5173/",
    credentials:true
}));

const authRouter= require("./routes/auth.js");
const profileRouter= require("./routes/profile.js");
const requestRouter= require("./routes/request.js");
const userRouter = require("./routes/user.js");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);

app.post("/user/delete",userAuth,async (req,res)=>{
    try {
        const response = await userModel.deleteOne(req.body);
        console.log(response);        
        res.send("User deleted successfully: " + response.deletedCount.toString());
    }
    catch (err) {
        res.status(400).send("Something went wrong, Error: ",err?.message);
    }    
});

app.get("/users",userAuth,async (req,res)=>{   
    try { 
        const user=await userModel.find(req.body);
        if(user.length>0) {
            res.send(user);        
        }
        else {
            res.status(404).send("Users not found.");
        }
    }
     catch (err) {
        res.status(400).send("Something went wrong, Error: ",err?.message);
    }
});

app.get("/user",userAuth,async (req,res)=>{
    try {
        const user=await userModel.findOne(req.body);
        if(user) {
            res.send(user);
        }
        else {
            res.status(404).send("User not found.");
        }
    }
    catch (err) {
        res.status(400).send("Something went wrong, Error: ",err?.message);
    }
});

app.use("/",
    (error,req,res,next)=>{
        console.log(error);        
        if(error) {
            res.status(500).send("Some error");    
        }
    }
);

connectDB().then(()=>{
    console.log("Connected to DB");    
    app.listen(8080,()=>{
    console.log('Server started successfully on port 8080.');
});
}).catch(err=>{
    console.log(err," Connection to DB failed");
});