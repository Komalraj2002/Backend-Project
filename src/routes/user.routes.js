import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js"; 
import { loginUser} from "../controllers/user.controller.js"; 
import { logoutUser} from "../controllers/user.controller.js";
import { refreshAccessToken} from "../controllers/user.controller.js";
import {changeCurrentPasword} from "../controllers/user.controller.js";
import {getCurrentUser} from "../controllers/user.controller.js";
import {updateAccountDetails} from "../controllers/user.controller.js";
import {updateUserAvatar} from "../controllers/user.controller.js";
import {updateUserCoverimage} from "../controllers/user.controller.js";
import {getUserChannelProfile} from "../controllers/user.controller.js";
import {getWatchHistory} from "../controllers/user.controller.js";

import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()
 
router.route("/register").post(upload.fields([
    {
      name:"avatar",
      maxCount: 1
    },
    {
     name:"coverimage",
      maxCount: 1
    }
]),registerUser)

router.route("/login").post(loginUser)
//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPasword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverimage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)

export default router