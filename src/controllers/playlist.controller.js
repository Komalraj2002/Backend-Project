import mongoose, { isValidObjectId } from "mongoose";
import { PlayList } from "../models/playlist.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new apiError(400, "invalid user input");
  }

  const createPlaylist = await PlayList.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!createPlaylist) {
    throw new apiError(401, "createPlaylist not found");
  }

  return res
    .status()
    .json(
      new apiResponse(200, createPlaylist, " playlist created sucessfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!isValidObjectId(userId)) {
    throw new apiError(400, "Invalid userId  ");
  }

  const userPlaylists = await PlayList.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              foreignField: "video",
              localField: "_id",
              as: "likes",
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
        ],
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
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        videos: 1,
        name: 1,
        description: 1,
        owner: 1,
      },
    },
  ]);
  if (!userPlaylists) {
    throw new apiError(401, " playList not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, userPlaylists, "playlist found sucessfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "invalid playlistid");
  }

  const playlist = await PlayList.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "Owner",
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
        Owner: {
          $first: "$owner",
        },
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
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videos: 1,
        owner: 1,
      },
    },
  ]);
  if (!playlist) {
    throw new apiError(401, " playlist not found ");
  }

  return res
    .status(200)
    .json(new apiResponse(200, playlist, " playlist found sucessfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, " videoId is invalid");
  }
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, " playlistId is invalid");
  }

  const addVideo = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        video: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!addVideo) {
    throw new apiError(401, "add video not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, addVideo, "video added to playlit sucessfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, " videoId is invalid");
  }
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, " playlistId is invalid");
  }

  const removeVideo = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $pull: videoId,
    },
    {
      new: true,
    }
  );

  if (!removeVideo) {
    throw new apiError(401, "remove video not found");
  }

  return res
    .status(200)
    .json((200, addVideo, "video added to playlit sucessfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, " playlistId is invalid");
  }

  const deletePlaylist = await PlayList.findByIdAndDelete(playlistId);

  if (!deletePlaylist) {
    throw new apiError(401, "remove playlist not found");
  }

  return res.status(200).json((200, addVideo, "playlist removed sucessfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, " playlistId is invalid");
  }

  if (!name || !description) {
    throw new apiError(401, "invalid user input");
  }

  const update = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $set: { name, description },
    },
    {
      new: true,
    }
  );

  if (!update) {
    throw new apiError(402, "update not happened");
  }

  return res
    .status(200)
    .json(new apiResponse(200, update, " playlist upadted sucessfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
