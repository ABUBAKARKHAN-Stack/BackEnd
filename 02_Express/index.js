// Express is a web application framework for Node.js
// It provides a set of features for building web applications and APIs
// This application demonstrates basic CRUD operations on a 'tea' resource
// CRUD stands for Create, Read, Update, Delete

// Importing the express module to create the server
import express from 'express'; 

// Initializing the Express application
const app = express(); 

// Setting the port for the server
const port = 3000; 

// Middleware to enable JSON parsing for incoming requests
app.use(express.json()); 

// Array to store tea data (mock database), and an ID counter to give each tea a unique ID
let teaData = []; 
let id = 1; 

// POST request to add a new tea (Create operation)
// Route: /teas
// Example request body: { "name": "Green Tea", "price": 5 }
app.post('/teas', (req, res) => {
    // Extracting the name and price of the tea from the request body
    const { name, price } = req.body;

    // Creating a new tea object with a unique ID
    const newTea = {
        id: id++, // Auto-increment ID for each tea
        name,
        price
    };

    // Adding the new tea to the teaData array (simulating saving to a database)
    teaData.push(newTea);

    // Sending a response with status 201 (Created) and the new tea data
    res.status(201).send(newTea);
});

// GET request to retrieve all teas (Read operation)
// Route: /teas
// Responds with the entire list of teas
app.get('/teas', (req, res) => {
    // Sending the list of all teas as the response
    res.status(200).send(teaData);
});

// GET request to retrieve a specific tea by ID (Read operation)
// Route: /teas/:id
// Example: /teas/1
app.get('/teas/:id', (req, res) => {
    // Finding the tea by ID from the teaData array using the find() method
    const tea = teaData.find((tea) => tea.id === parseInt(req.params.id));

    // If the tea is not found, send a 404 (Not Found) error response
    if (!tea) return res.status(404).send(`Tea with ID ${req.params.id} is not available`);

    // If tea is found, send it with status 200 (OK)
    res.status(200).send(tea);
});

// PUT request to update an existing tea by ID (Update operation)
// Route: /teas/:id
// Example request body: { "name": "Updated Tea", "price": 10 }
app.put('/teas/:id', (req, res) => {
    const teaId = req.params.id; // Extracting the tea ID from the URL

    // Finding the tea by ID from the teaData array
    const tea = teaData.find((tea) => tea.id === parseInt(teaId));

    // If the tea is not found, send a 404 error response
    if (!tea) return res.status(404).send(`Tea with ID ${teaId} is not available`);

    // Extracting the updated name and price from the request body
    const { name, price } = req.body;

    // Updating the tea object with new values
    tea.name = name;
    tea.price = price;

    // Sending the updated tea as a response with status 200 (OK)
    res.status(200).send(tea);
});

// DELETE request to remove a tea by ID (Delete operation)
// Route: /teas/:id
// Example: /teas/1
app.delete('/teas/:id', (req, res) => {
    // Filtering out the tea with the matching ID from the teaData array
    teaData = teaData.filter((tea) => tea.id !== parseInt(req.params.id));

    // If no tea remains (or if the tea with the given ID was not found), send a 404 error response
    if (teaData.length <= 0) return res.status(404).send(`Tea with ID ${req.params.id} is not available`);

    // Sending a success message confirming the deletion
    res.status(200).send(`Tea with ID ${req.params.id} Deleted.`);
});

// Starting the server on the specified port
// Once the server is running, this callback function will log that the server is listening on the specified port
app.listen(port, () => {
    console.log(`Server is listening on port: ${port}...`); // Logging that the server has started
});
