const { mongoose } = require("mongoose");
const uri="mongodb+srv://dheerajsawlani101:UMoaGcrFqE0vGUm9@dscluster0810.nozlmpw.mongodb.net/devTinder?appName=DSCluster0810";

const connectDB = async ()=>{
    await mongoose.connect(uri);
};

module.exports=connectDB;