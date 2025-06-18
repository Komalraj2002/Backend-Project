import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like: total video views, total subscribers, total videos, total likes etc.

  const likeandviews = await Video.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        $size: "$likes",
      },
    },
    {
      $group: {
        _id: null, // sabko ek group mein dal diya ignorong id
        totalViews: { $sum: "$views" }, // sab videos ke views add karo
        totalLikes: { $sum: "$likes" }, // sab videos ke likes add karo
      },
    },
  ]);

  const totalvideos = await Video.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(req.user._id),
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
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: {
          $size: "$likes",
        },
        owner: {
          $arrayElemAt: ["$owner", 0],
        },
      },
    },
  ]);

  const totalSubscribers = await Subscription.find({
    channel: req.user._id,
  }).countDocuments();

  const stats = likeandviews [0] || { totalViews: 0, totalLikes: 0 };

  const dashboardData = {
    videos:totalvideos,
    totalSubscribers,
    totalViews: stats.totalViews,
    totalLikes: stats.totalLikes,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        dashboardData,
        "The backend stats are fetched successfull"
      )
    );
});

export { getChannelStats };
