// Import required modules
const express = require('express');
const path = require('path');

// Create an Express application
const app = express();

// Define the port the server will run on.
// Use the environment's port if available, otherwise default to 3000
const PORT = process.env.PORT || 3000;

// Serve static files (like your index.html) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server and listen for incoming requests
app.listen(3000, '0.0.0.0', () => {
    console.log("Server is running on port 3000");
  });
  