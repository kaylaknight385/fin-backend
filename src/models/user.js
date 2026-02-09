const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

//user schemaaaaa omgggggggg
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, 
        unique: true, 
        trim: true, 
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name can not exceed 50 characters']
    },
    email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String, 
    required: [true, 'Please provide password'],
    minlength: [6, 'Password must be at lease 6 characters'],
    select: false;
  }
})