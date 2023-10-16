const http = require("http"); // Import the Node.js HTTP module
const app = require("./app"); // Import the Express application
const server = http.createServer(app); // Create an HTTP server using the Express app
const cors = require('cors'); // Import the CORS middleware

const { API_PORT } = process.env; // Get the API_PORT value from environment variables
const port = process.env.PORT || API_PORT; // Use the provided PORT value or API_PORT as the server port

app.use(cors()); // Enable CORS for the Express app

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
