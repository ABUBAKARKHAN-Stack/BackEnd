import { Router } from "express";
import { userRegistration, logoutUser } from "../controllers/index.js";
import { upload, verifyJWT } from '../middlewares/index.js'

const router = Router()

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

// Secured Routes
router.route('/logout').post(verifyJWT, logoutUser)

export default router