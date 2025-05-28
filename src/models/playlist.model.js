import mongoose, {Schema} from "mongoose";
const playlistSchema = new Schema({
name:{
    type:String,
    required : true
},
discription:{
    type:String,
    required:true
},
video:[{
    type: Schema.Types.ObjectId,
    ref:"Video"
}],
owner:{
    types :Schema.Types.ObjectId,
    ref :"User"
}

},{
    timestamp:true
})
export const PlayList = mongoose.model("PlayList",playlistSchema)



















