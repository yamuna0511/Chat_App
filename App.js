import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Connect to the WebSocket server
const socket = io('http://localhost:3000'); // Ensure this matches your server's address

function App() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        console.log('Attempting to connect to WebSocket...');

        // Handle WebSocket connection
        socket.on('connect', () => {
            console.log('WebSocket connected:', socket.id);
        });

        // Handle connection errors
        socket.on('connect_error', (err) => {
            console.error('WebSocket connection failed:', err.message);
        });

        // Load chat history
        socket.on('chat-history', (history) => {
            console.log('Received chat history:', history); // Log for debugging
            setMessages(history); // Set the received history as the initial messages
        });

        // Listen for incoming messages
        socket.on('message', (msg) => {
            console.log('Received new message:', msg); // Log for debugging
            setMessages((prev) => [...prev, msg]);
        });

        // Clean up the event listeners when the component unmounts
        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('chat-history');
            socket.off('message');
        };
    }, []);

    // Send a message to the server
    const sendMessage = () => {
        if (message.trim()) {
            console.log('Sending message:', message); // Log for debugging
            socket.emit('message', message);
            setMessage(''); // Clear the input
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>React Chat App</h1>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                style={{ width: '300px', padding: '10px', marginRight: '10px' }}
            />
            <button onClick={sendMessage} style={{ padding: '10px 20px' }}>
                Send
            </button>
            <ul style={{ listStyleType: 'none', padding: '0', marginTop: '20px' }}>
                {messages.map((msg, index) => (
                    <li key={index} style={{ margin: '10px 0', border: '1px solid #ddd', padding: '10px' }}>
                        {msg}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;