
import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
if(!title || !description){
    throw new apiError(400 , "title and description required")
}
if(req.file?.vediofile || req.file?.thumbnail){
    throw new apiError(400 , "vediofile , thumbnail is required")
}
const videoLocalPath = req.file?.vediofile[0].path
const thumbnailLocalPath = req.file?.thumbnail[0].path
if(!videoLocalPath || !thumbnailLocalPath){
throw new apiError(402 , "")
}
const video = await uploadOnCloudinary(videoLocalPath)
const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
if(!video.url || !thumbnail.url){
throw new apiError(401 ,"error while uploading on cloudinary" )
}

const uploadVedio = await Video.findByIdAndUpdate(
 req.user._id,
 {
 $set:{
    title:title,
    videofile:video.url,
    thumbnail:thumbnail.url,
    discription:description,
    duration:video.duration,
    owner:req?.user._id

 }
 },{
    new: true
 }
)
if(!uploadVedio){
throw new apiError(404, "video cannot be created")
}


return res.status(200)
.json (new apiResponse(200 , uploadVedio , "video ans thumbnail uploaded sucessfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
