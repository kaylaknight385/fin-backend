import Budget from '../models/Budget.js';
import Transaction from '../models/Transactions.js';

// get all budgets for logged in user
// ROUTE -   GET /api/budgets
export const getBudgets = async (req, res) => {
  try {
    const { month, category } = req.query;

    // we filter heeeere
    const filter = { user: req.user.id };

    if (month) {
      filter.month = month; // Format: "2025-02"
    } else {
      // default to current month if not specified
      const currentMonth = new Date().toISOString().slice(0, 7);
      filter.month = currentMonth;
    }

    if (category) {
      filter.category = category;
    }

    const budgets = await Budget.find(filter).sort({ category: 1 });

    // calculate total budget and total spent
    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const remaining = totalLimit - totalSpent;
    const percentUsed = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    res.json({
      success: true,
      count: budgets.length,
      data: {
        budgets,
        summary: {
          totalLimit,
          totalSpent,
          remaining,
          percentUsed
        }
      }
    });

  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching budgets'
    });
  }
};

// get single budget
// ROUTE -   GET /api/budgets/:id
export const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // SECURITY!!! make sure budget belongs to user
    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this budget'
      });
    }

    // calculate percentage used
    const percentUsed = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
    const remaining = budget.limit - budget.spent;

    res.json({
      success: true,
      data: {
        budget,
        stats: {
          percentUsed,
          remaining,
          isOverBudget: budget.spent > budget.limit
        }
      }
    });

  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching budget'
    });
  }
};

// create new budget
// ROUTE - POST /api/budgets
export const createBudget = async (req, res) => {
  try {
    const { category, limit, month } = req.body;

    // use current month if not provided
    const budgetMonth = month || new Date().toISOString().slice(0, 7);

    // check if budget already exists for this category and month
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
      month: budgetMonth
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        error: `Budget for ${category} already exists for ${budgetMonth}`
      });
    }

    // calculate current spending for this category and month
    const startDate = new Date(budgetMonth + '-01');
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const transactions = await Transaction.find({
      user: req.user.id,
      category,
      type: 'expense',
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    const spent = transactions.reduce((sum, t) => sum + t.amount, 0);

    // create budget
    const budget = await Budget.create({
      user: req.user.id,
      category,
      limit,
      spent,
      month: budgetMonth
    });

    res.status(201).json({
      success: true,
      data: {
        budget
      }
    });

  } catch (error) {
    console.error('Create budget error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error creating budget'
    });
  }
};

// we update budget here
// ROUTE -  PUT /api/budgets/:id
export const updateBudget = async (req, res) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // SECURITY: make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this budget'
      });
    }

    const { category, limit, spent } = req.body;

    // update the fields
    if (category !== undefined) budget.category = category;
    if (limit !== undefined) budget.limit = limit;
    if (spent !== undefined) budget.spent = spent;

    await budget.save();

    res.json({
      success: true,
      data: {
        budget
      }
    });

  } catch (error) {
    console.error('Update budget error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error updating budget'
    });
  }
};

// delete budget
// ROUTE - DELETE /api/budgets/:id
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this budget'
      });
    }

    await budget.deleteOne();

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });

  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting budget'
    });
  }
};

// Recalculate budget spent amounts based on transactions
// ROUTE -   POST /api/budgets/recalculate
export const recalculateBudgets = async (req, res) => {
  try {
    const { month } = req.body;
    const budgetMonth = month || new Date().toISOString().slice(0, 7);

    // get all budgets for this month
    const budgets = await Budget.find({
      user: req.user.id,
      month: budgetMonth
    });

    // calculate date range
    const startDate = new Date(budgetMonth + '-01');
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // update each budget's spent amount
    for (const budget of budgets) {
      const transactions = await Transaction.find({
        user: req.user.id,
        category: budget.category,
        type: 'expense',
        date: {
          $gte: startDate,
          $lt: endDate
        }
      });

      budget.spent = transactions.reduce((sum, t) => sum + t.amount, 0);
      await budget.save();
    }

    res.json({
      success: true,
      message: `Recalculated ${budgets.length} budgets for ${budgetMonth}`
    });

  } catch (error) {
    console.error('Recalculate budgets error:', error);
    res.status(500).json({
      success: false,
      error: 'Error recalculating budgets'
    });
  }
};