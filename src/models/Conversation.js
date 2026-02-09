import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true //makes queries fasterrr
    },
    userMessage: {
        type: String,
        required: [true, 'User message is required'],
        trim: true,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    aiMessage: {
        type: String,
        required: [true, 'AI message is required'],
        trim: true
    },
    theme: {
        type: String, 
        enum: {
            values: ['cosmic', 'garden', 'neon'],
            message: '{VALUE} is not valid theme'
        },
        required: true
    },
    agentName: {
        type: String,
        enum: ['Nova', 'Bloom', 'Pixel'],
        required: true
    },
    context: {
        //store whatever financial data was used for this response
        balance: Number,
        monthlySpending: Number,
        budgetStatus: String
    }, 
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

//using index for fsater queries by user and date
conversationSchema.index({ user: 1, timestamp: -1 });

export default mongoose.model('Conversation', conversationSchema);
