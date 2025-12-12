const express = require("express");
const { adminAuth } = require("./utils/auth");
const app = express();


app.use("/user",
    (req,res,next)=>{
        res.send("Response 1");    
        next();
    },
    (req,res)=>{
        console.log('test 2');        
        //res.send("Response 2");
    }
);
// app.use("/admin",adminAuth);

app.get("/admin/getalldata",adminAuth,(req,res)=>{    
    res.send({firstname:"Dheeraj",lastname:"Sawlani"});    
});

app.get("/admin/deletedata",(req,res)=>{    
    res.send("Data deleted.");    
});

// app.get("/user/:userid",(req,res)=>{
//     console.log(req.params);
//     res.send({firstname:"Dheeraj",lastname:"Sawlani"});
// });

// app.post("/user",(req,res)=>{
//     res.send("Data saved.");
// });


// this order is important, because whatever matches first gets executed
app.listen(3000,()=>{
    console.log('Server started successfully.');
});
