import { Router } from "express";
import { userRegistration } from "../controllers/index.js";
import { upload } from '../middlewares/index.js'

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar" , 
            maxCount: 1
        },
        {
            name: "coverImage" , 
            maxCount: 1
        },
    ]),
    userRegistration
)

export default router