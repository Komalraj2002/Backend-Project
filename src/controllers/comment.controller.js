import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { comment } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "invalid videoId");
  }

  if (!comment) {
    throw new apiError(402, " comment not avilable");
  }

  const addComment = await Comment.create({
    $set: {
      content: comment,
      video: videoId,
      owner: req.user._id,
    },
  });

  if (!addComment) {
    throw new apiError(401, "comment cannot be added");
  }

  return res
    .status(200)
    .json(new apiResponse(200, addComment, "comment added sucessfully"));
});

 const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "videoId is invalid");
  }

  const allComment = await Comment.aggregate([
    {
      $match: {
        video: mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $skip: (Number(page) - 1) * Number(limit),
    },
    {
      $limit: Number(limit),
    },
    {
      $project: {
        content: 1,
        owner: 1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: {
          $project: {
            username: 1,
            avatar: 1,
          },
        },
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
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
      },
    },
  ]);

  if (!allComment) {
    throw new apiError(402, "comment can not fetched");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, allComment, " all comments are fetched sucessfully")
    );
});

 const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(commentId)) {
    throw new apiError(400, " invalid commentId");
  }

  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  if (!updateComment) {
    throw new apiError(400, "comment not updated");
  }

  return res
    .status(200)
    .json(new apiResponse(200, updateComment, "comment updated sucessfully"));
});

 const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new apiError(400, " invalid commentId");
  }

  const deleteComment = await Comment.findByIdAndDelete(commentId);

  if (!deleteComment) {
    throw new apiError(400, "comment not deleted ");
  }

  return res
    .status(200)
    .json(new apiResponse(200, deleteComment, "comment deleted sucessfully"));
});

export { addComment, getVideoComments, deleteComment, updateComment };
