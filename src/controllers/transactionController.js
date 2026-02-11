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

//get a single transaction
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

// create new transaction 
// ROUTE - POST /api/transactions
export const createTransaction = async (req, res) => {
    try {
        const { description, amount, type, category, date } = req.body;

        //we create a transaction here 
        const transaction = await Transaction.create({
            user: req.user.id,
            description,
            amount,
            type,
            category,
            date: date || Date.now()
        });

        //new transactions updates user balance here MWAH
        const user = await User.findById(req.user.id);
        if (type === 'income') {
            user.balance += amount; //adding amount
        } else if (type === 'expense') {
            user.balance -= amount; //subtracting amount
        }
        await user.save();

        //update budget if exists for this category and month
    if (type === 'expense') {
      const currentMonth = new Date(transaction.date).toISOString().slice(0, 7); // YYYY-MM format
      
      const budget = await Budget.findOne({
        user: req.user.id,
        category: category,
        month: currentMonth
      });

      if (budget) {
        budget.spent += amount;
        await budget.save();
      }
    }
    // check for cashback eligibility
    if (type === 'expense') {
        const descriptionLower = description.toLowerCase();
        let platform = null;
        let platformDisplay = null;
        let percentage = 0;

  // cashback platform detection with different percentages
  const cashbackPlatforms = [
    // gaaaaming - 5% cashback
    { keywords: ['roblox', 'robux'], platform: 'roblox', display: 'Roblox', percentage: 5 },
    { keywords: ['steam'], platform: 'steam', display: 'Steam', percentage: 5 },
    { keywords: ['playstation', 'psn', 'ps store'], platform: 'playstation', display: 'PlayStation Store', percentage: 5 },
    
    // streaming/music - 5% cashback
    { keywords: ['twitch'], platform: 'twitch', display: 'Twitch', percentage: 5 },
    { keywords: ['spotify'], platform: 'spotify', display: 'Spotify', percentage: 5 },
    { keywords: ['apple music'], platform: 'apple-music', display: 'Apple Music', percentage: 5 },
    { keywords: ['youtube premium', 'youtube'], platform: 'youtube', display: 'YouTube', percentage: 5 },
    
    // shopping - 3% cashback
    { keywords: ['tiktok shop', 'tiktok'], platform: 'tiktok', display: 'TikTok Shop', percentage: 3 },
    { keywords: ['amazon'], platform: 'amazon', display: 'Amazon', percentage: 3 },
    { keywords: ['shein'], platform: 'shein', display: 'SHEIN', percentage: 3 },
    { keywords: ['temu'], platform: 'temu', display: 'Temu', percentage: 3 },
    
    // beauty - 4% cashback
    { keywords: ['sephora'], platform: 'sephora', display: 'Sephora', percentage: 4 },
    { keywords: ['ulta'], platform: 'ulta', display: 'Ulta', percentage: 4 },
    
    // travel/events - 3% cashback
    { keywords: ['airbnb'], platform: 'airbnb', display: 'Airbnb', percentage: 3 },
    { keywords: ['ticketmaster'], platform: 'ticketmaster', display: 'Ticketmaster', percentage: 3 }
  ];

  // find matching platform
  for (const item of cashbackPlatforms) {
    if (item.keywords.some(keyword => descriptionLower.includes(keyword))) {
      platform = item.platform;
      platformDisplay = item.display;
      percentage = item.percentage;
      break; // stop after first match
    }
  }

  // create cashback reward if platform detected
  if (platform) {
    const cashbackAmount = (amount * percentage) / 100;
    
    await CashbackReward.create({
      user: req.user.id,
      platform,
      platformDisplay,
      amount: cashbackAmount,
      transactionAmount: amount,
      percentage
    });

    // Add cashback to user balance
    user.balance += cashbackAmount;
        await user.save();
    }
}
    res.status(201).json({
        success: true,
        data: {
            transaction
        }
    });

    } catch (error) {
        console.error('Creating transaction error', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json ({
                success: false,
                error: messages[0]
            });
        
        }

        res.status(500).json ({
            success: false,
            error: 'Error creating transaction'
        });
    }
};

//updatinnnng transaction
//ROUTE - PUT /api/transaction/:id

export const updateTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }

        //SECURITY- does user own transaction? lets make sure
        if (transaction.user.toString() !== req.user.id) {
            return res.status(403).json ({
                success: false,
                error: 'Not authorized to update this transaction '
            });
        }
        const { description, amount, type, category, date } = req.body;

        //if transaction amount or type changes, we adjust user balance here. period.
        const user = await User.findById(req.user.id);

        if (transaction.type === 'income') {
            user.balance -= transaction.amount;
        } else {
            user.balance += transaction.amount;
        }

        //update transaction here
        transaction.description = description || transaction.description;
        transaction.amount = amount || transaction.amount;
        transaction.type = type || transaction.type;
        transaction.category = category || transaction.category;
        transaction.date = date || transaction.date;

        await transaction.save();

        //apply updated effects to balance
        if (transaction.type === 'income') {
            user.balance += transaction.amount;
        } else {
            user.balance -= transaction.amount;
        }

        await user.save();

        res.json({
            success: true,
            data: {
                transaction
            }
        });

    } catch (error) {
        console.error('Update transaction error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.meassage);
            return res.status(400).json({
                success: false,
                error: messages[0]
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error updating transaction'
        });
    }

};

//delete transaction
//ROUTE - DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByID(req.params.id);

        if (!transaction) {
            return res.status(404).json ({
                success: false,
                error: 'Transaction not found'
            });
        }

        //MORE SECURITY YEAH. U OWN THIS TRANSACTION???
        if (transaction.user.toString() !== req.user.id) {
            return res.status(403).json ({
                success: false,
                error: 'Not authorized to delete this transaction'
            });
        }
        //deleted transactions will update user balance
        const user = await User.findByID(req.user.id);
        if (transaction.type === 'income') {
            user.balance -= transsaction.amount;
        } else {
            user.balance += transaction.amount;
        }
        await user.save();


        //update budget if nessacary
        if (transaction.type === 'expense') {
            const currentMonth = new Date(transaction.date).toISOString.slice(0, 7);

            const budget = await Budget.findOne({
                user: req.user.id,
                catergory: transaction.category,
                month: currentMonth
            });

            if (budget) {
                budget.spent -= transaction.amount;
                await budget.save();
            }
        }

        await transaction.deleteOne();

        res.json({
            success: true,
            message: 'Transaction successfully deleted'
        });
        
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting transaction'
        });
    }
};