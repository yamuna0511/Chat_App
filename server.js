const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors'); // Import CORS for cross-origin requests

// App and Server Setup
const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3001', // Allow requests from React frontend
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
const PORT = 3000;

// MySQL Database Configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Default XAMPP user
    password: '', // Default password is empty
    database: 'chat_app', // Database for the chat application
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to MySQL database!');
});

// Middleware
app.use(cors()); // Enable CORS for all routes

// Serve the HTML file for the chat interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Retrieve and send chat history to newly connected clients
    const query = 'SELECT text FROM messages ORDER BY created_at ASC';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving messages from database:', err.message);
            return;
        }
        const messages = results.map((row) => row.text); // Extract message text
        socket.emit('chat-history', messages); // Send chat history to the client
        console.log(`Sent chat history to client ${socket.id}:`, messages);
    });

    // Listen for new messages from clients
    socket.on('message', (msg) => {
        console.log(`Message received from ${socket.id}: ${msg}`);

        // Insert the new message into the MySQL database
        const insertQuery = 'INSERT INTO messages (text) VALUES (?)';
        connection.query(insertQuery, [msg], (err) => {
            if (err) {
                console.error('Error inserting message into database:', err.message);
                return;
            }
            console.log(`Message saved to database: ${msg}`);
        });

        // Broadcast the message to all connected clients
        io.emit('message', msg);
        console.log(`Broadcasted message to all clients: ${msg}`);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log(`A user disconnected: ${socket.id}`);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
