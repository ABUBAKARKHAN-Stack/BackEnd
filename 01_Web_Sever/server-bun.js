// This Server is Created With Bun 
import { serve } from 'bun'; // Importing the 'serve' function from the Bun framework

// The 'serve' function initializes a server
serve({
    // The 'fetch' function handles incoming requests
    fetch(request) {
        const url = new URL(request.url); // Parsing the requested URL
        
        // Checking if the requested route is the home route ("/")
        if (url.pathname === "/") {
            return new Response('Hello Ice Tea', { status: 200 }); // Returning a response with status 200 (OK)
        } 
        // Checking if the requested route is "/ice-tea"
        else if (url.pathname === "/ice-tea") {
            return new Response('I love ice tea :)', { status: 200 }); // Returning a response with status 200 (OK)
        } 
        // Handling all other routes (for undefined routes)
        else {
            return new Response('404 Not Found', { status: 404 }); // Returning a response with status 404 (Not Found)
        }
    },
    port: 3000, // Defining the port on which the server will listen
    hostname: '127.0.0.1' // Defining the hostname (localhost)
});
