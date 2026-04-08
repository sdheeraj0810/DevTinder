const cron = require('node-cron');
const connectionRequestModel = require('../models/connectionRequest');

cron.schedule('* * * * *',async () => {
    try{
        const pendingReq = await connectionRequestModel.find({
            status:"intrested"
        }).populate("fromUserId toUserId");
        const listofEmails = [
            ...new Set(pendingReq?.map(req => req.toUserId?.emailId))
        ];
        console.log(listofEmails); 
    }
    catch (e) {
        console.log(e);
    }
});