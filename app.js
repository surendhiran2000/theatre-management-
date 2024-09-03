// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./model/user')
const Booking = require('./model/booking')
const cors = require('cors');

// Creating an Express application instance
const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
    origin: '*', // allow this origin to access the server
    methods: 'GET,POST,PUT,DELETE', // allowed HTTP methods
    credentials: true, // allow credentials (cookies, authorization headers, etc.)
}));

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/mydatabase')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });


// Middleware to parse JSON bodies
app.use(express.json());

// Route to register a new user
app.post('/api/register', async (req, res) => {
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to authenticate and log in a user
app.post('/api/login', async (req, res) => {
    try {
        // Check if the email exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ message: "login successful", userId: user._id, email: user.email, username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to bookings a new user
app.post('/api/bookings', async (req, res) => {
    try {
        // Create a new Bookings
        const newBookings = new Booking({
            user_id: req.body.id,
            customer_name: req.body.customer_name,
            customer_mobileNo: req.body.customer_mobileNo,
            number_of_tickets: req.body.number_of_tickets
        });

        await newBookings.save();
        res.status(201).json({ message: 'ticket booked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected route to get user details
app.get('/api/bookings/:id?', async (req, res) => {
    try {
        const userId = req.params.id;
        let bookings;
        if (userId) {
            bookings = await Booking.find({ user_id: userId });
        } else {
            // Fetch user details using decoded token
            bookings = await Booking.find();
        }
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected route to delete a booking by ticket_id
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const ticketId = req.params.id;  // Get the ticket_id from the request parameters

        // Delete the booking with the specified ticket_id
        const result = await Booking.deleteOne({ ticket_id: ticketId });

        if (result.deletedCount === 0) {
            // No document was found with the specified ticket_id
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Successfully deleted
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to bookings and Login API!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});