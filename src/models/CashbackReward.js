import mongoose from "mongoose";

const cashbackRewardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    platform: {
        type: String, 
        enum: ['Roblox',
             'Steam', 
             'Twitch', 
             'Tiktok Shop', 
             'Playstation Store', 
             'Youtube',
             'Spotify', 
             'Apple Music', 
             'Airbnb', 
             'Sephora', 
             'Ulta', 
             'Shein',
             'Temu', 
            'Ticketmaster', 
            'AMC Theaters'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    transactionAmount: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
        default: 5, //5% cashback
    }, 
    date: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('CashbackReward', cashbackRewardSchema);