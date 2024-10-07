// Importing the 'http' module to create a server in Node.js
const http = require("http");
// Defining the hostname and port on which the server will run
const hostname = 'localhost';
const port = 3000;

// Creating the server
const server = http.createServer((req, res) => {
    // Checking if the requested URL is the home route ("/")
    if (req.url === "/") {
        res.statusCode = 200; // Setting status code to 200 (OK)
        res.setHeader('Content-Type', 'text/plain'); // Setting the response content type as plain text
        res.end("Hello ICE TEA"); // Ending the response with a message
    } 
    // Checking if the requested URL is "/ice-tea"
    else if (req.url === "/ice-tea") {
        res.statusCode = 200; // Setting status code to 200 (OK)
        res.setHeader('Content-Type', 'text/plain'); // Setting the response content type as plain text
        res.end("Thanks for ordering ice tea :)"); // Ending the response with a message
    } 
    // Handling any other routes (for routes not defined)
    else {
        res.statusCode = 404; // Setting status code to 404 (Not Found)
        res.setHeader('Content-Type', 'text/plain'); // Setting the response content type as plain text
        res.end("404 not found :("); // Ending the response with a 404 message
    }
});

// Starting the server and making it listen on the defined hostname and port
server.listen(port, hostname, () => {
    console.log(`Server is listening at https://${hostname}:${port}`); // Logging the server start message
});
