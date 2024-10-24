import { Router } from "express";
import { userRegistration, loginUser, logoutUser , refreshAccessToken , changeCurrentPassword, getCurrentUser, getUserChannelProfile, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getWatchHistory } from "../controllers/index.js";
import { upload, verifyJWT } from '../middlewares/index.js'

const router = Router()

// Unsecured Routes
router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        },
    ]),
    userRegistration
)
router.route('/login').post(loginUser)
router.route('/refresh-token').post(refreshAccessToken)

// Secured Routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/change-password').post(verifyJWT , changeCurrentPassword)
router.route('/current-user').get(verifyJWT , getCurrentUser)
router.route('/channel/:username').get(verifyJWT , getUserChannelProfile)
router.route('/update-account').patch(verifyJWT , updateAccountDetails)
router.route('/update-avatar').patch(verifyJWT , upload.single('avatar') , updateUserAvatar)
router.route('/update-coverImage').patch(verifyJWT , upload.single('coverImage') , updateUserCoverImage)
router.route('/history').get(verifyJWT , getWatchHistory)

export default router