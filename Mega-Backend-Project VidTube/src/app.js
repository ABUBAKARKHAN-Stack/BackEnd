import express, { json } from 'express'
import cors from 'cors'
import logger from './logger.js'
import morgan from 'morgan';
const app = express()



app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)

// Common Middleware
app.use(json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))

//    ++++++++++++++++++++++++++++++++++ Advance Loggers Morgon Winston  ++++++++++++++++++++++++++++++++++++++++++++++++
const morganFormat = ":method :url :status :response-time ms";
app.use(
    morgan(morganFormat, {
        stream: {
            write: (message) => {
                const logObject = {
                    method: message.split(" ")[0],
                    url: message.split(" ")[1],
                    status: message.split(" ")[2],
                    responseTime: message.split(" ")[3],
                };
                logger.info(JSON.stringify(logObject));
            },
        },
    })
);

// import routes
import {healthcheckRouter} from './routes/index.js'


// Routes
app.use('/api/v1/healthcheck', healthcheckRouter)


export default app