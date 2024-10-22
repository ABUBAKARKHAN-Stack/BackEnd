import { uploadOnCloudinary, deleteFromCloudinary, ApiResponse, asyncHandler, ApiError } from '../utils/index.js'
import { userModel } from '../models/index.js'
import jwt from 'jsonwebtoken'

// Generate Access and Refresh Tokens
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await userModel.findById(userId)

        if (!user) {
            throw new ApiError(404, 'User not found')
        }

        const accessToken = user.generateAccessToekn();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, error?.message || 'Something went wrong while generating access and refresh token')
    }
}


// Register  new User
const userRegistration = asyncHandler(async (req, res) => {
    const { fullName, email, password, username } = req.body

    // validation
    if (
        [fullName, email, password, username].some((field) => field?.trim() === '')
    ) {
        throw new ApiError(400, 'All fields are required')
    }

    // check if user exists
    const existedUser = await userModel.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(409, 'User with that email or username already exists')
    }

    //  Handle Files 
    console.warn(req.files)
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is required')
    }

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log('Uploaded Avatar', avatar);
    } catch (error) {
        console.log('Error uploading avatar', error);
        throw new ApiError(500, 'Something went wrong while uploading avatar')
    }

    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
        console.log('Uploaded Cover Image', coverImage);
    } catch (error) {
        console.log('Error uploading cover image', error);
        throw new ApiError(500, 'Something went wrong while uploading cover image')
    }

    // create user
    try {
        const user = await userModel.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage.url || "",
            email,
            password,
            username: username.toLowerCase(),
        })

        const createdUser = await userModel.findById(user._id).select("-password -refreshToken")

        if (!createdUser) {
            throw new ApiError(500, 'Something went wrong while registering user')
        }

        return res
            .status(201)
            .json(new ApiResponse(201, createdUser, 'User registered successfully'))
    } catch (error) {
        console.log('Error registering user', error);
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }
        throw new ApiError(500, 'Something went wrong while registering user and images were deleted')
    }
})

// Login User
const loginUser = asyncHandler(async (req, res) => {
    // get email and password from req.body  
    const { email, password, username } = req.body

    // validation
    if (
        [email, password, username].some((field) => field?.trim() === '')
    ) {
        throw new ApiError(400, 'All fields are required')
    }

    const user = await userModel.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, 'User not found')
    }

    // check if password is correct
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid email or password')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await userModel.findById(user._id)
        .select("-password -refreshToken");

    if (!loggedInUser) {
        throw new ApiError(500, 'Something went wrong while logging in user')
    }

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, option)
        .cookie('refreshToken', refreshToken, option)
        .json(new ApiResponse('200',
            { user: loggedInUser, accessToken, refreshToken },
            'User logged in successfully'
        ));
});

// Logout User  
const logoutUser = asyncHandler(async (req, res) => {
    await userModel.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true
        }
    )

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }

    return res
        .status(200)
        .clearCookie('accessToken', option)
        .clearCookie('refreshToken', option)
        .json(new ApiResponse(200, {}, 'User logged out successfully'))
})

// Refresh Token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Refresh token not found');
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await userModel.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(404, 'Invalid Refresh Token')
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Invalid Refresh Token')
        }

        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie('accessToken', accessToken, option)
            .cookie('refreshToken', newRefreshToken, option)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    'Access token and refresh token refreshed successfully'
                )
            );

    } catch (error) {
        throw new ApiError(500, 'Something went wrong while refreshing access token')
    }

})


// Change Current Password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await userModel.findById(req.user?._id)

    const isPassValid = await user.isPasswordCorrect(oldPassword)

    if (!isPassValid) {
        throw new ApiError(401, 'Old Password is Incorrect')
    }

    user.password = newPassword

    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Password change successfully'))
})

// Get Current User 
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, 'Current User Details'))
})

// Update Account Details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !username || !email) {
        throw new ApiError(400, 'Fullname and email are required')
    }

    const user = await userModel.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, user, 'Account details updated successfully'))
})

// Update User Avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is required')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(500, 'Something went wrong while updating avatar')
    }

    const user = await userModel.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(200, user, 'Avatar Updated successfully')
})

// Update Cover Image
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, 'Cover Image is required')
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(500 , 'Something went wrong  while  uploading cover image')
    }

    const user = await userModel.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")


    return res
    .status(200)
    .json(200, user, 'Cover image Updated successfully')
})




export {
    userRegistration,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage

}
