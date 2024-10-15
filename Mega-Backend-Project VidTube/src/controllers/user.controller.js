import { uploadOnCloudinary, deleteFromCloudinary, ApiResponse, asyncHandler, ApiError } from '../utils/index.js'
import { userModel } from '../models/index.js'
import jwt from 'jsonwebtoken'


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
    const user = await userModel.findByIdAndUpdate(
        // TODO:: Need to comeback after middleware video
    )
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


export {
    userRegistration,
    loginUser,
    refreshAccessToken
}