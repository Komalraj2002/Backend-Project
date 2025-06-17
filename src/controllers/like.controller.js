import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video (the current user liked the video or not)

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid videoId");
  }

  const islike = await Like.findOne(
    //find that the current userlike the video or not this combination exist in db or not
    {
      video: videoId,
      likedBy: req.user._id,
    }
  );
  let Liked;

  if (!islike) {
    //if not liked we will make it liked by creaing this data in db
    await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    Liked = true;
  } else {
    //if the user has already liked and liked again to dislike
    await Like.findByIdAndDelete({
      video: videoId,
      likedBy: req.user._id,
    });
    Liked = false;
  }

  return res
    .status(200)
    .json(new apiResponse(200, `video ${Liked ? "liked" : "unliked"}`));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment  (weather the comment is liked by the user or not)

  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid commentId ");
  }

  const isLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  let liked;

  if (!isLiked) {
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    liked = true;
  } else {
    await Like.findByIdAndDelete({
      comment: commentId,
      likedBy: req.user._id,
    });
    liked = false;
  }

  return res
    .status(200)
    .json(new apiResponse(200, `comment ${liked ? "liked " : " unliked"}`));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "Invalid tweetId ");
  }

  const isLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  let liked;
  if (!isLiked) {
    await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    liked = true;
  } else {
    await Like.findByIdAndDelete({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    liked = false;
  }

  return res
    .status(200)
    .json(new apiResponse(200, ` ${liked ? " liked" : "unliked"} `));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "video",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              foreignField: "_id",
              localField: "video",
              as: "likes",
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
        isLiked: {
          $cond: {
            if: { $in: [req.user._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $unwind: "$videos", // Flatten the array to get a single video object per like
    },
    {
      $replaceRoot: {
        newRoot: "$videos", // Replace the root with the video document ,now all connectons are made with videos
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "owner",
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
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(200, likedVideos, "all liked videos fetched sucessfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
