import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";
//register user
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
    [username, email, fullname, password].some((field) => field?.trim() === "") //checks all the fields if they are present trims them and check if they are empty or not
  ) {
    throw new apiError(400, "all fields are required");
  }
  const existedUser = user.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new apiError(
      409,
      "username with this username and email already exists"
    );
  }
  const avatarLocalPath = req.files?.avatar[0]?.path
 const coverimageLocalPath = req.files?.coverimage[0]?.path

 if (!avatarLocalPath) {
    throw new apiError(
      400,
      "Avatar file is required"
    );
  }

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverimage = await uploadOnCloudinary(coverimageLocalPath)
 if (!avatar) {
    throw new apiError(
      400,
      "Avatar file is required"
    );
  }
const user = await user.create({
    fullname,
     avatar: avatar.url,
     coverimage:coverimage?.url || "",
     email,
     password,
     username: username.toLowerCase(),

})

const createdUser = await user.findById(user._id).select(
    "-password -refreshToken"  
)

if (!createdUser){
    throw new apiError(500 , "something went wrong while registering the user")
}


return res.this.status(201).json(
    new apiResponse (200,createdUser,"user registered sucessfully ")
)






});

export { registerUser };
