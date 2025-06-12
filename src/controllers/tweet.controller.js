import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
//import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  // take content from req.body  and user id and jwt token
  //create tweet and add things in tweet modle
  // send res
  const {content} = req.body;

  if (!content) {
    throw new apiError(400, "Invalid user input");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  if (!tweet) {
    throw new apiError(401, "tweet not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, tweet, "tweet saved sucessfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets , likes and owner of a tweet
  const {userId} = req.params;
  if (!isValidObjectId(userId)) {
    throw new apiError(400, " uerId not found ");
  }

  const userTweet = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
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
            $project: {
              avatar: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likes: {
          $likes: "likes",
        },
        owner: {
          $first: "owner",
        },
      },
    },
  ]);
  if (userTweet.length === 0) {
    return res
      .status(200)
      .json(new apiResponse(200, userTweet, "the user did not tweet yet"));
  }

  return res
    .status(200)
    .json(200, userTweet, "the user tweet are fetched sucessfully");
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const {tweetId} = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "invalid tweetId");
  }

  const {content} = req.body;
  if (!content) {
    throw new apiError(401, "content is required");
  }

  const updateTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );
  if (updateTweet) {
    throw new apiError(402, "updateTweet is not defined");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, updateTweet, " user tweets are fetched sucessfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const {tweetId} = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "invalid tweetId");
  }

  const deleteTweet = await Tweet.findByIdAndDelete(tweetId);
  if (!deleteTweet) {
    throw new apiError(402, "deleteTweet is not defined");
  }

  return res.status(200).json(new apiResponse(" tweet delete sucessfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
