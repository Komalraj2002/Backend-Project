import mongoose, { isValidObjectId } from "mongoose";
//import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription (weather the user subscribed the channel or not)

  if (!isValidObjectId(channelId)) {
    throw new apiError(400, "channelId is required");
  }

  const isAlreadyExixt = await Subscription.findOne({  //find in the db weather this combination exist 
    channel: channelId,
    subscriber: req.user._id,
  });

  let isSubscribed;

  if (isAlreadyExixt != null) {    //if yes , if user has subscribed alreadedy it return isSubscribed false
   
    await Subscription.findByIdAndDelete({
      channel: channelId,
      subscriber: req.user._id,
    });
    isSubscribed = false;
  } else {
    await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    });

    isSubscribed = true;
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { isSubscribed },
        ` channel ${isSubscribed === true ? "subscribed " : "unsubscribed"} sucessfully`
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new apiError(400, "channelId is required");
  }

  const Subscriber = await Subscription.findOne({
    channel: channelId,
  }).populate(
    "subscriber",
    "-password , -refreshToken , -watchHistory , -coverimage , -createdAt , updatedAt"
  );

  if (Subscriber.length <= 0) {
    throw new apiError(402, " no subscribers yet");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, Subscriber, "subscribers list fetched sucessfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new apiError(400, "subscriberId is required");
  }

  const channels = await Subscription.findOne({
    subscriber: subscriberId,
  }).populate(
    "channels",
    "-refreshToken , -watchHistory , -coverimage , -createdAt , updatedAt "
  );

  if (channels.length <= 0) {
    throw new apiError(401, "no channel subscribed yet");
  }

  return res
    .status(200)
    .json(new apiResponse(200, channels, "channels fetched sucessfully "));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
