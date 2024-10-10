import { uploadOnCloudinary, deleteFromCloudinary, ApiResponse, asyncHandler, ApiError } from '../utils/index.js'
import { userModel } from '../models/index.js'

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


export {
    userRegistration
}