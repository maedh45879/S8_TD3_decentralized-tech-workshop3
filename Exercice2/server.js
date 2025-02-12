const express = require('express');
const app = express();
const PORT = 3001; // Change the port if needed

// Define a simple route
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
