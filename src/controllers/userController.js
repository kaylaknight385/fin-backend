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

