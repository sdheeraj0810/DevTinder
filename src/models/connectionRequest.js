const mongoose = require("mongoose");

const connectionRequest = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    status: {
        type: String,
        enum: {
            values: ["ignored","accepted","rejected","intrested"],
            message: '{VALUE} is not supported.'
        },
        required: true
    }
},{
    timestamps:true
});

connectionRequest.index({ fromUserId: 1, toUserId: 1 });

connectionRequest.pre("save", function () {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("From and to user ids are same.");
  }
});



const connectionRequestModel=new mongoose.model("ConnectionRequest",connectionRequest);

module.exports=connectionRequestModel;
