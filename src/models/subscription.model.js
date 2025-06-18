import  mongoose , {Schema } from "mongoose";
const subscriptionSchema = new Schema({
    subscriber:{
         type:Schema.Types.ObjectId, //one who is suscribing (user)
        ref:"User"
    },
     channel:{
         type:Schema.Types.ObjectId, //one to whome suscriber is subscribing 
        ref:"User"
    }
},{
    timestamps: true
})
export const Subscription = mongoose.model("Subscription" , subscriptionSchema)










