const adminAuth=(req,res,next)=>{        
    console.log('Validated');
    
    const isValid=true;
    if(!isValid){
        res.send("User not valid");
    }   else {
        next();
    } 
};
module.exports={adminAuth};