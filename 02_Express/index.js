// Importing required modules and initializing environment variables
import 'dotenv/config';
import logger from "./logger.js"; // Custom logger module
import morgan from "morgan"; // HTTP request logger middleware
import express from 'express'; // Express framework

// Initializing the Express application
const app = express();

// Setting the port for the server
const port = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware to log HTTP requests and responses
const morganFormat = ":method :url :status :response-time ms"; // Define the logging format
app.use(
    morgan(morganFormat, {
        stream: {
            write: (message) => {
                const logObject = {
                    method: message.split(" ")[0], // Extract method (GET, POST, etc.)
                    url: message.split(" ")[1],    // Extract URL
                    status: message.split(" ")[2],  // Extract HTTP status
                    responseTime: message.split(" ")[3], // Extract response time
                };
                logger.info(JSON.stringify(logObject)); // Log the extracted information
            },
        },
    })
);

// Array to store tea data (simulating a database) and an ID counter for unique tea IDs
let teaData = [];
let id = 1;

// POST request to create a new tea
// Route: /teas
// Example request body: { "name": "Green Tea", "price": 5 }
app.post('/teas', (req, res) => {
    // Extracting name and price from the request body
    const { name, price } = req.body;

    // Log warnings if name or price is invalid
    if (!name) {
        logger.warn(`Tea name is not available; it must be a non-empty string`);
    } else {
        logger.info(`Tea name is ${name}`);
    }
    
    if (price === null || price === undefined) {
        logger.warn(`Tea price is not available; it must be defined`);
    } else {
        logger.info(`Tea price is ${price}`);
    }

    // Creating a new tea object with a unique ID
    const newTea = {
        id: id++, // Auto-increment ID for each new tea
        name,
        price
    };
    
    // Log the incoming request body for tracking
    logger.info('A POST request was made to /teas with the following body: ' + JSON.stringify(req.body));
    
    // Add the new tea to the teaData array (simulating saving to a database)
    teaData.push(newTea);

    // Sending a response with status 201 (Created) and the new tea data
    res.status(201).send(newTea);
});

// GET request to retrieve all teas
// Route: /teas
app.get('/teas', (req, res) => {
    logger.info('A GET request was made to /teas');
    // Sending the list of all teas as the response
    res.status(200).send(teaData);
});

// GET request to retrieve a specific tea by ID
// Route: /teas/:id
// Example: /teas/1
app.get('/teas/:id', (req, res) => {
    logger.info('A GET request was made to /teas/' + req.params.id);
    // Finding the tea by ID from the teaData array
    const tea = teaData.find((tea) => tea.id === parseInt(req.params.id));

    // If the tea is not found, send a 404 (Not Found) error response
    if (!tea) {
        logger.error(`Tea with ID ${req.params.id} is not available`);
        return res.status(404).send(`Tea with ID ${req.params.id} is not available`);
    }

    // If the tea is found, send it with status 200 (OK)
    res.status(200).send(tea);
});

// PUT request to update an existing tea by ID
// Route: /teas/:id
// Example request body: { "name": "Updated Tea", "price": 10 }
app.put('/teas/:id', (req, res) => {
    logger.info('A PUT request was made to /teas/' + req.params.id + ' with the following body: ' + JSON.stringify(req.body));
    const teaId = req.params.id; // Extracting the tea ID from the URL

    // Finding the tea by ID from the teaData array
    const tea = teaData.find((tea) => tea.id === parseInt(teaId));

    // If the tea is not found, send a 404 error response
    if (!tea) {
        logger.error(`Tea with ID ${teaId} is not available`);
        return res.status(404).send(`Tea with ID ${teaId} is not available`);
    }

    // Extracting the updated name and price from the request body
    const { name, price } = req.body;

    // Updating the tea object with new values
    tea.name = name;
    tea.price = price;

    // Sending the updated tea as a response with status 200 (OK)
    res.status(200).send(tea);
});

// DELETE request to remove a tea by ID
// Route: /teas/:id
// Example: /teas/1
app.delete('/teas/:id', (req, res) => {
    logger.info('A DELETE request was made to /teas/' + req.params.id);
    
    // Filtering out the tea with the matching ID from the teaData array
    const initialLength = teaData.length;
    teaData = teaData.filter((tea) => tea.id !== parseInt(req.params.id));

    // If no tea remains or if the tea with the given ID was not found, send a 404 error response
    if (teaData.length === initialLength) {
        logger.error(`Tea with ID ${req.params.id} is not available`);
        return res.status(404).send(`Tea with ID ${req.params.id} is not available`);
    }

    // Sending a success message confirming the deletion
    res.status(200).send(`Tea with ID ${req.params.id} deleted.`);
});

// Starting the server on the specified port
app.listen(port, () => {
    console.log(`Server is listening on port: ${port}...`); // Log that the server has started
});
