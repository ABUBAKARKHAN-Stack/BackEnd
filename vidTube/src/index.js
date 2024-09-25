import express from "express";
import logger from "./logger.js";
import morgan from "morgan";
const app = express()



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



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`APP is running on PORT ${PORT}`))