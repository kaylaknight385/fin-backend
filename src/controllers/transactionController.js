import Transactions from "../models/Transactions.js";
import User from "..models/User.js"
import Budget from "../models/Budget.js"
import CashbackReward from "../models/CashbackReward.js";

//Get ALL transactions for logged in user
//ROUTE - GET /api/transactions
export const getTransactions = async (req, res) => {
    try {
        const {type, category, startDate, endDate} = req.query;

        //we filter here
        const filter = { user: req.user.id };

        if (type) filter.type = type;
        if (category) filter.category = category;
        if (startDate || endDate ) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(filter)
            .sort({date: -1}) //most recent transaction first
            .limit(100); //lol limit to 100 tranactions 
        
        res.json({
            success: true,
            count: transactions.length,
            data: {
                transactions
            }
        });
    } catch (error) {
        console.error('Transaction Error:', error);
        res.status(500).json({
            success:false,
            error: 'Error fetching transactions'
        });
    }
};

//Get a single transaction
// ROUTE - GET /api/transactions/:id
export const getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json ({
                success: false,
                error: 'Transaction not found'
            });
        }
        //SECURITY! making sure user is who they are and if they are allowed to view trans
        if (transaction.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                error: 'Not authorized to view this transaction' 
            });
        }
        res.json ({
            success: true,
            data: {
                transaction
            }
        });
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching transaction'
        });
    }
};