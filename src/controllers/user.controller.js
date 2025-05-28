import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from froentend
  //vaidation = not empty
  //check if user already exist usernam and email
  //check for images ,check for avatar
  //uplode them to cloudinary,avatar
  //create user object - create entry in db
  //remove password and refreh token from response
  //check for user creation
  //return res

  const { username, email, fullname, password } = req.body;
  console.log(username);

  if (
    [username, email, fullname, password].some((field) => field?.trim() === "") // checks all the fields if they are present trims them and check if they are empty or not
  ) {
    throw new apiError(400, "all fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }], //or is a mongodb operator that finds the user in the db based on username or email any one of these two fields
  });
  if (existedUser) {
    throw new apiError(
      409,
      "username with this username and email already exists"
    );
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverimageLocalPath = req.files?.coverimage[0]?.path

  let coverimageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverimageLocalPath = req.files.coverimage[0].path;
  }

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverimage = await uploadOnCloudinary(coverimageLocalPath);
  if (!avatar) {
    throw new apiError(400, "Avatar file is required");
  }
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    //This tells Mongoose to exclude (-) the password and refreshToken fields from the result.The result will include all other fields except these two sensitive fields.
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "user registered sucessfully "));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body ->data
  //username or email
  //find the user
  //pasword check
  //if paassword correct acssestoken or refresh token
  //send cookies

  const { username, email, password } = req.body;
  if (!(username || email)) {
    throw new apiError(400, "username and email is required");
  }

  const user = await User.findOne({
    //user
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new apiError(404, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password); //here we user user not User becoz User is for mongodb methods like finone find by id user is for the method grenrated by us
  if (!isPasswordValid) {
    throw new apiError(404, "invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-refreshToken  -password"
  );

  //for cookies
  const options = {
    //using this we made the cookies not editable by frontend developers but they can view (only view not edit)
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "user logged in sucessfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id, //this come from the middleware verifyJWT
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, //the new in mongoodb allow it to send the new data in response(which contain undefined refreshtoken) not old
    }
  );
  const options = {
    //using this we made the cookies not editable by frontend developers but they can view (only view not edit)
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "user loggedOut in sucessfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new apiError(401, "unauthorizd request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ); // incomming token which is refreshtoken and is now decoded menas we have all the information now of this decoded token

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new apiError(401, "invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "refresh token is expired or used");
    }
    const options = {
      //using this we made the cookies not editable by frontend developers but they can view (only view not edit)
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user?._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshAccessToken: newRefreshToken },
          "accesstoken refresh sucessfully"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || "invalid refresh token ");
  }
});

const changeCurrentPasword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  //if the user is changing password means it is login means the login api run and verify token run which means the req.user = user;(from authmiddleware) have user
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new apiError(401, "invalid old password");
  }

  user.password = newPassword; //this says user contain password that we are changing and it trigger the save() in user modle
  user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "password changed sucessfully "));
};

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched sucessfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new apiError(401, "all fields are required ");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, user, "Account details updated sucessfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new apiError(400, "avatar file is missing ");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new apiError(400, "error while uploding and avatar ");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, user, "avatar updated sucessfully"));
});

const updateUserCoverimage = asyncHandler(async (req, res) => {
  const coverimageLocalPath = req.file?.path;
  if (!coverimageLocalPath) {
    throw new apiError(400, "coverimage file is missing ");
  }
  const coverimage = await uploadOnCloudinary(coverimageLocalPath);
  if (!coverimage.url) {
    throw new apiError(400, "error while uploding and coverimage ");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverimage: coverimage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, user, "coverimage updated sucessfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params; //req.params is an object that contains route parameters — values extracted from the URL when a route with named parameters is matched.
  if (!username?.trim()) {
    throw new apiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      //satage1
      // This filters the documents to only include the one with the matching username
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      //this is used for knowing how many subscriber does the user have
      $lookup: {
        from: "subscriptions", // The name of the collection to join with
        localField: "_id", // Field from the User collection
        foreignField: "channel", // Field from the subscriptionS collection
        as: "subscribers ", // Output array field to store the matched subscriptions
      },
    },
    {
      //this is used for knowing how many users have subscribed to your channel
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo ",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",  // Use $size to count elements in the subscribers array
        },
        $channelsSubscribedToCount: {
          $size: "$subscribedTo", // Count of channels the user is subscribed to
        },
        issubscribed: {
          $cond: {
           if:{ $in: [req.user?._id, "$subscribers.subscriber"]},  // Check if current user is in the list of subscribers
           then:true, //if yes
           else:false // if no
          },
        },
      },
    },
    {
      //stage 5 Project only selected fields to the final result
      $project:{
        fullName: 1,
        username:1,
        email:1,
        avatar:1,
        coverimage:1,
        subscribersCount:1,
        channelsSubscribedToCount:1,
        issubscribed:1

      }
    }
  ]);
  if(!channel?.length){
    throw new apiError(404 , "channel does not exist")
  }
  return res
  .status(200)
  .json(new apiResponse(200 , channel[0] , "user channel fetched sucessfully"))
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPasword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverimage,
  getUserChannelProfile,
};






