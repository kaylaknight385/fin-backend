import CashbackReward from "../models/CashbackReward.js";

//get all the caskabck rewards for the logged in user
//ROTUE - GET /api/cashback

export const getCashbackRewards = async (req. res) => {
    try {
        const {platform, startDate, endDate} = req.query;

        //we filer here
        const filter = {user: req.user.id};

        if (platforom) {
            filter.platform = platform;
        }

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const rewards = await CashbackReward.find(filter)
            .sort({date: -1}) //sort by most recent first
            .limit(100);

        //calculate total rewards earned
        const totalEarned = rewards.reduce((sum, reward) => sum + reward.amount, 0)

        res.json({
            success: true, 
            count: rewards.length,
            data: {
                rewards, 
                totalEarned: totalEarned.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Cashback Rewards error:', error);
        res.status(500).json({
            success:false, 
            error: 'Error fetching cashback rewards'
        });
    }
};

// get total cashback 
//ROUTE - GET /api/cashback/total
export const getTotalCashback = async (req, res) => {
    try {
        const {period} = req.query; //for searching through month, year, all

        const filter = {user: req.user.id};

        //filter by time period
        if (period === 'month') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            filter.date = { $gte: startOfMonth };
        } else if (period === 'year') {
            const startOfYear = new Date(new Date().getFullYear(), 0, 1);
            filter.date = { $gte: startOfYear };
        }

        const rewards = await CashbackReward.find(filter);

        const totalEearned = rewards.reduce((sum, reward) => sum + reward.amount, 0)
        const totalTransactions = rewards.length;

        //group by their platform
        const byPlatform = rewards.reduce((acc, reward) => {
            if (!acc[reward.platform]) {
                acc[reward.platform] = {
                    platform: reward.platform,
                    platformDisplay: reward.platformDisplay,
                    totalEarned: 0,
                    count: 0
                };
            }
            acc[reward.platform].totalEarned += reward.amount;
            acc[reward.platform].count += 1;
            return acc;

        }, ());

        //make an array and sort total
        const platformStats = Object.values(byPlatform)
        .sort((a, b) => b.totalEarned - a.totalEearned);

        res.json({
            success: true,
            data: {
                totalEearned: totalEarned.toFixed(2),
                totalTransactions,
                period: period || 'all',
                byPlatform: platformStats
            }
         });
    } catch (error) {
        console.error('Get total cashback error:', error);
        res.status(500).json({
            success: false, 
            error: 'Error fetching total cashback'   
        });
    }
};