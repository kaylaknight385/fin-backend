import Budget from '../models/Budget.js';
import Transaction from '../models/Transactions.js';

//Get all budgets from logged in userrr
//ROUTE - GET /api/budgets
export const getBudget = async (req, res) => {
    try {
        const {month, category} = req.query;

        //our filter
        const filter = {user: req.user.id};

        if (month) {
            filter.month = month;
        } else {
            //default current month if not specified
            const currentMonth = new Date().toISOString().slice(0, 7);
            filter.month = currentMonth;
        }

        if (category)
    }
}