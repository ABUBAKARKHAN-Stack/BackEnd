import jwt from "jsonwebtoken";
import { userModel } from '../models/index.js'
import { ApiError, asyncHandler } from '../utils/index.js'

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies.accessToken || req.body.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
        throw new ApiError(401, 'Unauthorized')
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await userModel.findById(decoded?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, 'Unauthorized')
        }
        req.user = user;

        next()
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid Access Token')
    }
})