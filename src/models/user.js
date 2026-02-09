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
  },
  theme: {
    type: String, 
    enum: {
        values: ['nova', 'bloom', 'pixel'],
        message: '{VALUE} is not a valid theme'
    },
    default: 'nova'
  },
  balance: {
    type: Number, 
    default: 0, 
    min: [0, 'Balance cannot be negative']
  }, 
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date, 
    default: Date.now
  }, 
    timestamps: true
});

//hashing password before adding to databasssse
userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});