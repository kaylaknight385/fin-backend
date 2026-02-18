import { getAIResponse } from '../services/aiService.js';
import User from '../models/user.js';
import Transaction from '../models/Transactions.js';
import Budget from '../models/Budget.js';
import Conversation from '../models/Conversation.js';

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // get user and their theme
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // get that financial context
    const transactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(20);
    
    const budgets = await Budget.find({ user: userId });
    
    const monthlySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

    const context = {
      balance: user.balance,
      monthlySpending,
      budgetRemaining: totalBudget - totalSpent
    };

    // get recent conversation history for context
    const recentConversations = await Conversation.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(10);
    
    // make to messages format
    const conversationHistory = recentConversations.reverse().flatMap(c => [
      { role: 'user', content: c.userMessage },
      { role: 'assistant', content: c.aiMessage }
    ]);

    // get AI response
    const aiResponse = await getAIResponse(message, user.theme, context, conversationHistory);

    // save that convo the DB!
    await Conversation.create({
      user: userId,
      userMessage: message,
      aiMessage: aiResponse.message,
      theme: user.theme,
      timestamp: new Date(),
    });

    res.json(aiResponse);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get AI response' 
    });
  }
};

export const getConversationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json({ 
      success: true, 
      data: { conversations } 
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation history' });
  }
};

export const clearConversationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    await Conversation.deleteMany({ user: userId });
    
    res.json({ 
      success: true, 
      message: 'Conversation history cleared' 
    });
  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({ error: 'Failed to clear conversation history' });
  }
};