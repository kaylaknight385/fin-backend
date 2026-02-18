import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    description: {
        type: String, 
        required: [true, 'Please provide a description'],
        trim: true,
    },
    amount: {
        type: Number,
        required: [true, 'Please provide an amount'],
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
    }, 
    category: {
        type: String, 
        enum: ['food', 'entertainment', 'shopping', 'bills', 'transport', 'gaming', 'beauty', 'other', 'salary', 'freelance'],
        required: true,
    },
    date: {
        type: Date, 
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Transaction', transactionSchema);