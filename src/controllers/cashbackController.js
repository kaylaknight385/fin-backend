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


//Get specific cashback
//ROUTE - GET /api/cashback/platform/:platform
export const getCashbackByPlatform = async (req, res) => {
    try {
        const {platform} = req.params;

        const rewards = await CashbackReward.find({
            user: req.user.id,
            platform: platform
        }).sort({date: -1});

        if (rewards.length === 0) {
            return res.status(404).json ({
                success: false,
                error: `No cashback found for platform: ${platform}`
            });
        }

        const totalEarned = rewards.reduce((sum, reward) => sum + rewards.amount, 0);
        const avaeragePerTransaction = totalEarned / rewards.length;

        res.json({
            success: true,
            count: rewards.length,
            data: {
                platform: rewards[0].platformDisplay,
                rewards,
                stats: {
                    totalEarned: totalEarned.toFixed(2),
                    totalTransactions: rewards.length,
                    averagePerTransaction: averagePerTransaction.toFixed(2),
                    cashbackPercentage: rewards[0].percentage
                }
            }
        });
    } catch (error) {
        console.error('Get cashback by platform error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching platform cashback'
        });
    }
};


//Get cashback summary 
//ROUTE - GET /api/cashabck/stats

export const getCashbackStats = async (req, res) => {
    try {
        const allRewards = await CashbackReward.find({ user: req.user.id});

        //this month 
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthRewards = allRewards.filter( r => r.date >= startOfMonth);
        const monthTotal = monthRewards.reduce((sum, r) => sum + r.amount, 0);

        //all time summary
        const allTimeTotal = allRewards.reduce((sum, r) => sum + r.amount, 0);

        //top platform
        const platformTotals = allRewards.reduce((acc, r) => {
            acc[r.platform] = (acc[r.platform] || 0) + r.amount;
            return acc;
        }, {});

        const topPlatform = Object.entries(platformTotals)
        .sort(([, a], [, b]) => b - a)[0];

        //category breakdown 
        const categoryBreakdown = {
            gaming: ['roblox', 'steam', 'playstation'],
            streaming: ['twitch', 'spotify', 'apple-music', 'youtube'],
            beauty: ['sephora', 'ulta'],
            shopping: ['tiktok', 'amazon', 'shein', 'temu'],
            lifestyle: ['airbnb', 'ticketmaster']
        };

        const byCategory = {};
        for (const [category, platform] of Object.entries(categoryBreakdown)) {
            const categoryTotal = allRewards
                .filter(r => platform.includes(r.platform))
                .reduce((sum, r) => sum + r.amount, 0);

            if (categoryTotal > 0) {
                byCategory[category] = categoryTotal.toFixed(2);
            }

        }

        res.json({
            success: true, 
            data: {
                thisMonth: monthTotal.toFixed(2),
                allTime: allTimeTotal.toFixed(2),
                topPlatform: topPlatform ? {
                    platform: topPlatform[0],
                    earned: topPlatform[1].toFixed(2)
                } : null,
                byCategory,
                totalTransactions: allRewards.length
            }
        });
    } catch (error) {
        console.error('Get cashback stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching cashback statistics'
        });
    }
};