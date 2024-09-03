const mongoose = require('mongoose');
// Define a schema for the User collection
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

// Create a User model based on the schema
module.exports = mongoose.model('User', userSchema);
