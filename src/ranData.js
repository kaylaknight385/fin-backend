import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/user.js';
import Transaction from './models/Transactions.js';
import Budget from './models/Budget.js';
import CashbackReward from './models/CashbackReward.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // create demo user (or find existing)
    let user = await User.findOne({ email: 'demo@rizeup.com' });
    
    if (user) {
      console.log('Demo user already exists');
      // clear existing data for this user
      await Transaction.deleteMany({ user: user._id });
      await Budget.deleteMany({ user: user._id });
      await CashbackReward.deleteMany({ user: user._id });
    } else {
      // create new demo user
      user = await User.create({
        username: 'Demo User',
        email: 'demo@rizeup.com',
        password: 'demo123',
        theme: 'cosmic',
        balance: 0
      });
      console.log('Created demo user');
    }

    console.log(`Email: demo@rizeup.com`);
    console.log(`Password: demo123`);

    // added transactions
    const transactions = [
      // income
      { user: user._id, description: 'Freelance Web Design Project', amount: 850.00, type: 'income', category: 'freelance', date: new Date('2026-02-01') },
      { user: user._id, description: 'Part-time Barista Job', amount: 420.50, type: 'income', category: 'salary', date: new Date('2026-02-10') },
      
      // Food expenses
      { user: user._id, description: 'Chipotle Lunch', amount: 12.75, type: 'expense', category: 'food', date: new Date('2026-02-15') },
      { user: user._id, description: 'Starbucks Coffee', amount: 6.50, type: 'expense', category: 'food', date: new Date('2026-02-16') },
      { user: user._id, description: 'Trader Joes Groceries', amount: 67.89, type: 'expense', category: 'food', date: new Date('2026-02-12') },
      { user: user._id, description: 'Pizza with Friends', amount: 28.50, type: 'expense', category: 'food', date: new Date('2026-02-14') },
      
      // Gaming (triggers cashback)
      { user: user._id, description: 'Roblox Premium + Robux', amount: 24.99, type: 'expense', category: 'gaming', date: new Date('2026-02-13') },
      { user: user._id, description: 'Steam Winter Sale Games', amount: 45.98, type: 'expense', category: 'gaming', date: new Date('2026-02-08') },
      { user: user._id, description: 'PlayStation Plus Subscription', amount: 14.99, type: 'expense', category: 'gaming', date: new Date('2026-02-05') },
      
      // Streaming (triggers cashback)
      { user: user._id, description: 'Spotify Premium', amount: 10.99, type: 'expense', category: 'entertainment', date: new Date('2026-02-01') },
      { user: user._id, description: 'Netflix Standard Plan', amount: 15.49, type: 'expense', category: 'entertainment', date: new Date('2026-02-01') },
      { user: user._id, description: 'YouTube Premium', amount: 11.99, type: 'expense', category: 'entertainment', date: new Date('2026-02-01') },
      
      // shopping (some trigger cashback)
      { user: user._id, description: 'Amazon Prime Membership', amount: 14.99, type: 'expense', category: 'shopping', date: new Date('2026-02-01') },
      { user: user._id, description: 'Amazon Tech Accessories', amount: 52.34, type: 'expense', category: 'shopping', date: new Date('2026-02-11') },
      { user: user._id, description: 'SHEIN Clothing Order', amount: 38.76, type: 'expense', category: 'shopping', date: new Date('2026-02-09') },
      
      // entertainment
      { user: user._id, description: 'Movie Theater Tickets', amount: 32.00, type: 'expense', category: 'entertainment', date: new Date('2026-02-13') },
      { user: user._id, description: 'Ticketmaster Concert Tickets', amount: 89.50, type: 'expense', category: 'entertainment', date: new Date('2026-02-07') },
      
      // transport
      { user: user._id, description: 'Uber Ride to Campus', amount: 15.30, type: 'expense', category: 'transport', date: new Date('2026-02-16') },
      { user: user._id, description: 'Gas Fill Up', amount: 48.25, type: 'expense', category: 'transport', date: new Date('2026-02-10') },
      
      // bills
      { user: user._id, description: 'Gym Membership', amount: 39.99, type: 'expense', category: 'bills', date: new Date('2026-02-01') },
      { user: user._id, description: 'Phone Bill', amount: 55.00, type: 'expense', category: 'bills', date: new Date('2026-02-01') },
      
      // beauty
      { user: user._id, description: 'Sephora Skincare', amount: 78.45, type: 'expense', category: 'beauty', date: new Date('2026-02-06') },
    ];

    await Transaction.insertMany(transactions);
    console.log(`Added ${transactions.length} transactions`);

    // budgets
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budgets = [
      { user: user._id, category: 'food', limit: 400, spent: 115.64, month: currentMonth },
      { user: user._id, category: 'gaming', limit: 100, spent: 85.96, month: currentMonth },
      { user: user._id, category: 'entertainment', limit: 150, spent: 121.50, month: currentMonth },
      { user: user._id, category: 'shopping', limit: 250, spent: 106.09, month: currentMonth },
      { user: user._id, category: 'transport', limit: 120, spent: 63.55, month: currentMonth },
    ];

    await Budget.insertMany(budgets);
    console.log(`Added ${budgets.length} budgets`);

    // cashback rewards
    const cashbackRewards = [
      { user: user._id, platform: 'Roblox', amount: 1.25, transactionAmount: 24.99, percentage: 5, date: new Date('2026-02-13') },
      { user: user._id, platform: 'Steam', amount: 2.30, transactionAmount: 45.98, percentage: 5, date: new Date('2026-02-08') },
      { user: user._id, platform: 'Playstation Store', amount: 0.75, transactionAmount: 14.99, percentage: 5, date: new Date('2026-02-05') },
      { user: user._id, platform: 'Spotify', amount: 0.55, transactionAmount: 10.99, percentage: 5, date: new Date('2026-02-01') },
      { user: user._id, platform: 'Youtube', amount: 0.60, transactionAmount: 11.99, percentage: 5, date: new Date('2026-02-01') },
      { user: user._id, platform: 'Shein', amount: 1.16, transactionAmount: 38.76, percentage: 3, date: new Date('2026-02-09') },
      { user: user._id, platform: 'Sephora', amount: 3.14, transactionAmount: 78.45, percentage: 4, date: new Date('2026-02-06') },
      { user: user._id, platform: 'Ticketmaster', amount: 2.69, transactionAmount: 89.50, percentage: 3, date: new Date('2026-02-07') },
    ];

    await CashbackReward.insertMany(cashbackRewards);
    console.log(`Added ${cashbackRewards.length} cashback rewards`);

    // calculate and update user balance
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalCashback = cashbackRewards.reduce((sum, r) => sum + r.amount, 0);
    
    user.balance = totalIncome - totalExpenses + totalCashback;
    await user.save();
    console.log(`Updated balance to: $${user.balance.toFixed(2)}`);

    console.log('\nSeed data complete!');
    console.log('\nLogin with:');
    console.log('   Email: demo@rizeup.com');
    console.log('   Password: demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();