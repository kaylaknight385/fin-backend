import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        enum: ['food', 'entertainment', 'shopping', 'bills', 'transport', 'gaming', 'other'],
        required: true,
    },
    limit: {
        type: Number,
        required: [true, 'Please provide budget limit'],
    },
    spent: {
        type: Number,
        default: 0,
    },
    month: {
        type: String, //format: YYYY-MM
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model('Budget', budgetSchema);