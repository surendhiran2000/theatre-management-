const mongoose = require('mongoose');
// Define a schema for the User collection
const bookingSchema = new mongoose.Schema({
    user_id: String,
    ticket_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    customer_name: String,
    customer_mobileNo: String,
    number_of_tickets: Number
});

// Create a User model based on the schema
module.exports = mongoose.model('Booking', bookingSchema);
