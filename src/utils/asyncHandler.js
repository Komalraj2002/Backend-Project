const asyncHandler = (requestHandler)=>{
(req,res,next)=>{
    Promise.resolve(requestHandler(req,res,next)).catch((error)=>next(error))
}
}
export {asyncHandler}


//try catch method 
// const asyncHandler = (func) => async (req , res , next )=>{

// try {
//     await func(res,req,next)
// } catch (error) {
//     res.status(err.code || 500).json({
//         sucess:false,
//         message:err.message
//     })
// }
// }