import User from '../models/user.js';

//Get user profile
//ROUTE - GET /api/users/:id
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findbyId(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: user.getPublicProfile()
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success:false,
            error: 'Error fetching user profile'
        });
    }
};

//update user profile
//ROUTE - PUT/api/users/:id
export const updateUserProfile = async (req, res) => {
    try {
        const {name, theme, balance, savingsGoal, savingsProgess, savingsGoalName} = req.body;

        const user = await User.findById(req.param.id);
        if (!user) {
            return res.status(404).json({
                success:false,
                error: 'User not found'
            });
        }
        //security; Only allows users to update their own profile
        if (user._id.toString() !== req.user.id) {
            return res.status(403).json({
                success:false,
                error: 'Not authorized to update this profile'
            });
        }
        //update fields if provided
        if (name !== undefined) user.name = name;
        if (theme !== undefined) user.theme = theme;
        if (balance !== undefined) user.balance = balance;
        if (savingsGoal !== undefined) user.savingsGoal = savingsGoal;
        if (savingsProgress !== undefined) user.savingsProgress = savingsProgress;
        if (savingsGoalName !== undefined) user.savingsGoalName = savingsGoalName;

        const updateUser = await user.save();

        res.json({
            success: true,
            data: {
                user: updatedUser.getPublicProfile()
            }
        });
    } catch (error) {
        console.error('Update user profile error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                error: messages[0]
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error updating user profile'
        });
    }
};

//update user balance
// ROUTE - PATCH /api/users/:id/balance

export const updateUserBalance = async (req, res) => {
    try {
        const 
    }
}