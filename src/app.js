const express = require("express");
const { adminAuth } = require("./utils/auth");
const connectDB = require("./config/database.js");
const userModel = require("./models/user.js");
const app = express();

app.use(express.json());

app.post("/signup",async (req,res)=>{    
    const user=new userModel(req.body); 
    try {
        await user.save();
        res.send("User created successfully");
    }
    catch (err) {
        res.status(400).send("User creation failed, Error: ",err?.message);
    }    
});

app.post("/user/delete",adminAuth,async (req,res)=>{
    try {
        const response = await userModel.deleteOne(req.body);
        console.log(response);        
        res.send("User deleted successfully: " + response.deletedCount.toString());
    }
    catch (err) {
        res.status(400).send("Something went wrong, Error: ",err?.message);
    }    
});

app.patch("/user/:userId",adminAuth,async (req,res)=>{
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
        res.status(400).send("Something went wrong, Error: ",err?.message);
    }    
});

app.get("/users",adminAuth,async (req,res)=>{   
    try { 
        const user=await userModel.find(req.body);
        if(user.length>0) {
            res.send(user);        }
        else {
            res.status(404).send("Users not found.");
        }
    }
     catch (err) {
        res.status(400).send("Something went wrong, Error: ",err?.message);
    }
});
app.get("/user",adminAuth,async (req,res)=>{
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
    app.listen(3000,()=>{
    console.log('Server started successfully on port 3000.');
});
}).catch(err=>{
    console.log(err," Connection to DB failed");
});


