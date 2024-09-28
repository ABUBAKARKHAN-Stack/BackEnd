import logger from '../logger.js'
import { ApiResponse, asyncHandler } from '../utils/index.js'

// Health Check Controller

const healthcheck = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, 'OK', 'Health Check Passed'))
        
})

export { healthcheck }