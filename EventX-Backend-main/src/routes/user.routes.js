import {Router} from 'express';
import { changeCurrentPassword,
         loginUser, 
         logoutUser, 
         getCurrentUser,
         refreshAccessToken,
         registerUser, 
         updateAccountDetails,
         updateUserAvatar,
         authenticateWithMetaMask} from '../controllers/user.controllers.js';
import { verifyJWT } from '../middleware/verifyJWT.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/refresh-token").post(verifyJWT,refreshAccessToken);
router.route("/update-details").post(verifyJWT,updateAccountDetails);
router.route("/update-avatar").post(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/metamask").post(verifyJWT,authenticateWithMetaMask)

export default router