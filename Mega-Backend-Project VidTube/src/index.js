import dotenv from 'dotenv'
import app from "./app.js";
import logger from './logger.js';
import connectDB from './db/index.js';

dotenv.config({
    path: "./.env"
})


const PORT = process.env.PORT || 4000;

connectDB()
.then(()=>{
    app.listen(PORT, () => logger.info(`APP is running on PORT ${PORT}`))
})
.catch((err) => logger.error('Mongo DB Connection Error' , err))