import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
  {
    videofile: {
      type: String, //cloudnary data
      required: true,
    },
    thumbnail: {
      type: String, //cloudnary data
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    discription: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views:{
        type:Number,
        default:0,
    },
    idpublished:{
        type:Bollean,
        default: true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
  },
  
  { timestamps: true }
);
videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema);
