const { default: mongoose } = require("mongoose");

const messageSchema = new mongoose.Schema({
     message: {
        type: String,
        required:true
    },
    senderUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    }
},{
    timestamps:true
});

const chatSchema = new mongoose.Schema({
    messages: [messageSchema],
    participants : [
        {
            type :mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    ]
},{
    timestamps:true
});

const chatModel=new mongoose.model("Chat",chatSchema);

module.exports=chatModel;
