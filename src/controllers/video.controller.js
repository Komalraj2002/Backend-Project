import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
 
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new apiError(400, "title and description required");
  }
  if (req.file?.vediofile || req.file?.thumbnail) {
    throw new apiError(400, "vediofile , thumbnail is required");
  }
  const videoLocalPath = req.file?.vediofile[0].path;
  const thumbnailLocalPath = req.file?.thumbnail[0].path;
  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new apiError(402, "");
  }
  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!video.url || !thumbnail.url) {
    throw new apiError(401, "error while uploading on cloudinary");
  }

  const uploadVedio = await Video.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        title: title,
        videofile: video.url,
        thumbnail: thumbnail.url,
        discription: description,
        duration: video.duration,
        owner: req?.user._id,
      },
    },
    {
      new: true,
    }
  );
  if (!uploadVedio) {
    throw new apiError(404, "video cannot be created");
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        uploadVedio,
        "video ans thumbnail uploaded sucessfully"
      )
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(401, "Invalid videoID");
  }

  const user = await User.findById(req.user._id);
  user.watchHistory.push(videoId);
  await user.save({ validateBeforeSave: false });

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId), // match the id in video with the videoID
      },
    },
    {
      $lookup: {
        from: "likes", //like.video === video._id.”
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",

        pipeline: [
          {
            project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likes: {
          $size: "$likes",
        },
        owner: {
          $first: "$owner",
        },
        isLiked: {
          $cond: {
            $if: { $in: [req.user._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);
  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true });

  if (!video) {
    throw new apiError(403, "video not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, video, "video fetched sucessfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
 
  const { title, description } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "videoID is not valid");
  }

  if (!title || !description) {
    throw new apiError(401, "invalid user input");
  }

  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
      },
    },
    {
      new: true,
    }
  );

  if (!updateVideo) {
    throw new apiError(402, "upadted video not found");
  }

  return res.status(200).json(200, updateVideo, "video updated sucessfully");
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiError(400, "video ID not found");
  }

  const deleteVideo = await Video.findByIdAndDelete(videoId);
  if (deleteVideo) {
    throw new apiError(402, " deleted video not found");
  }

  return res.status(200).json(200, deleteVideo, "video deleted sucessfully");
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
