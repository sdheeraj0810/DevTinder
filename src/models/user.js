const mongoose = require("mongoose");
const validator= require("validator");

const userSchema = mongoose.Schema({
    firstName: {
        type:String,
        requried:true
    },
    lastName: {
        type:String
    },
    emailId: {
        type:String,
        requried:true,
        lowercase:true,
        trim:true,
        unique:true,
        minLength:5,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Email not valid.")
            }
        }
    },
    password: {
        type:String,
        requried:true,
        validate(value) {
            if(!validator.isStrongPassword(value)) {
                throw new Error("Password not strong enough.")
            }
        }
    },
    age: {
        type:Number,
        min:18
    },
    gender: {
        type:String,
        validate(value) //only called at creation
        { 
            if(["male","female","other"].includes(value)) {
                throw new Error("Gender data not valid.")
            }
        }
    },    
    skills: {
        type:[String]
    },
    photoUrl: {
        type:String,
        default:"https://avatars.githubusercontent.com/u/95699692?v=4",
        validate(value) {
            if(!validator.isURL(value)) {
                throw new Error("Photo URL not valid.")
            }
        }
    },
    about: {
        type:String,
        default:"Default value for about me."
    }
},{
    timestamps:true
});
const userModel=mongoose.model("User",userSchema);
module.exports=userModel;