const userModel = require("../models/user.js");
// const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");
// app.use(cookieParser());

const userAuth=async (req,res,next)=>{  
    try {      
        const {token} = req.cookies;
        if (!token) {
             return res.status(401).send("No token available"); 
        }
        const TokenValidDecodedValue = jwt.verify(token,"Dheeraj@0810"); 
        const {_id}=TokenValidDecodedValue;        
        const user = await userModel.findById(_id);
        if(!user) {
            throw new Error("User not valid");
        }
        req.user = user;
        next();
    }
    catch (err) {
        res.status(400).send("Something went wrong. " + err?.message)
    }
};
module.exports={userAuth};