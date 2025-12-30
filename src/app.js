const express = require("express");
const { userAuth } = require("./utils/auth");
const connectDB = require("./config/database.js");
const userModel = require("./models/user.js");
const { getErrorMessage } = require("./utils/validate.js");
const app = express();
const bcrypt= require("bcrypt");
const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");
app.use(express.json());
app.use(cookieParser());

app.post("/signup",async (req,res)=>{    
    
    const {firstName,lastName,emailId,password}=req.body;
    const passwordhash=await bcrypt.hash(password,10);
    console.log(passwordhash);
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
        res.send("User created successfully");
    }
    catch (err) {
        //console.log('mylog',err);        
        const errMsg=getErrorMessage(err);  //err?._message!=undefined ? err?._message : err?.errorResponse?.errmsg;
        res.status(400).send("User creation failed, Error: " + errMsg);
    }    
});

app.post("/login",async (req,res)=>{        
    try {    
        const {emailId,password}=req.body;
        const user = await userModel.findOne({emailId:emailId});
        if(!user) {
            throw new Error("Invalid credentials.");    
        }        
        const isPasswordValid=await user.validatePassword(password);
        console.log(isPasswordValid);
        
        if(!isPasswordValid) {
            throw new Error("Invalid credentials.");    
        }
        const token = await user.getJWT();

        res.cookie("token",token,{httpOnly:true,expires:new Date(Date.now()+360000)} );
        res.send("User logged in successfully");
    }
    catch (err) {        
        const errMsg=getErrorMessage(err);  //err?._message!=undefined ? err?._message : err?.errorResponse?.errmsg;
        res.status(400).send("Login failed, Error: " + errMsg);
    }    
});

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

app.patch("/user/:userId",userAuth,async (req,res)=>{
    try {
        const data = req.body;
        const allowedUpdates=[firstName,lastName,password,skills,photoUrl,about];
        const isAllowed=Object.keys(data).every((key)=>
            allowedUpdates.includes(key)
        );
        if(!isAllowed) {
            throw new Error("Updated on these files not allowed.");
        }
        if(data?.skills.length>10){
            throw new Error("Skills cannot be more than 10.");
        }
        const response = await userModel.findOneAndUpdate({_id:req.params.userId},data,
            {   
                returnDocument:'after',
                runValidators:true
            }
        );
        console.log(response);        
        res.send("User updated successfully.");
    }
    catch (err) {
        const errMsg=getErrorMessage(err);  //err?._message!=undefined ? err?._message : err?.errorResponse?.errmsg;
        res.status(400).send("Something went wrong, Error: "+errMsg);
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

app.get("/profile",userAuth,async (req,res)=>{
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