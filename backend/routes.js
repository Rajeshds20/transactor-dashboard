const router = require('express').Router();
const axios = require('axios');

const { Transactions } = require('./models')

router.get('/initialize-database', async (req, res) => {
    try {
        const response = await axios.get(
            'https://s3.amazonaws.com/roxiler.com/product_transaction.json'
        );
        const transactions = response.data;

        // Clear existing data and insert fresh data
        await Transactions.deleteMany({});
        await Transactions.insertMany(transactions);

        res.status(200).send({ message: 'Database initialized successfully.' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to initialize database', details: error.message });
    }
});

router.get('/transactions', async (req, res) => {
    try {
        const { search = '', page = 1, perPage = 10, month = null } = req.query;

        const regex = new RegExp(search, 'i');

        let query = {
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        }

        if (month != null && month != 0) {
            query = {
                ...query,
                $expr: {
                    $eq: [{ $month: "$dateOfSale" }, parseInt(month)]
                }
            };
        }

        const transactions = await Transactions.find(query)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));

        const totalRecords = await Transactions.countDocuments(query);

        res.status(200).send({
            transactions,
            pagination: {
                totalRecords,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalRecords / perPage),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to fetch transactions', details: error.message });
    }
});

router.get('/statistics', async (req, res) => {
    try {
        const { month } = req.query;

        const startDate = new Date(`${month} 1`);
        const endDate = new Date(`${month} 1`);
        endDate.setMonth(startDate.getMonth() + 1);

        const transactions = await Transactions.find({
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, parseInt(month)]
            },
        });

        // console.log(transactions);

        const totalSaleAmount = transactions.reduce((sum, t) => (t.sold ? sum + t.price : sum), 0);
        const soldItemsCount = transactions.filter((t) => t.sold).length;
        const unsoldItemsCount = transactions.length - soldItemsCount;

        res.status(200).send({
            totalSaleAmount,
            soldItemsCount,
            unsoldItemsCount,
        });
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch statistics', details: error.message });
    }
});

router.get('/bar-chart', async (req, res) => {
    try {
        const { month = 0 } = req.query;

        const startDate = new Date(`${month} 1`);
        const endDate = new Date(`${month} 1`);
        endDate.setMonth(startDate.getMonth() + 1);

        const transactions = await Transactions.find({
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, parseInt(month)]
            }
        });

        const ranges = [
            [0, 100],
            [101, 200],
            [201, 300],
            [301, 400],
            [401, 500],
            [501, 600],
            [601, 700],
            [701, 800],
            [801, 900],
        ];
        const rangeCounts = {};

        ranges.forEach(([min, max]) => {
            const rangeKey = `${min}-${max}`;
            rangeCounts[rangeKey] = transactions.filter((t) => t.price >= min && t.price <= max).length;
        });

        rangeCounts['901-above'] = transactions.filter((t) => t.price > 900).length;

        res.status(200).send(rangeCounts);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch bar chart data', details: error.message });
    }
});

router.get('/pie-chart', async (req, res) => {
    try {
        const { month } = req.query;

        const startDate = new Date(`${month} 1`);
        const endDate = new Date(`${month} 1`);
        endDate.setMonth(startDate.getMonth() + 1);

        const transactions = await Transactions.find({
            dateOfSale: { $gte: startDate, $lt: endDate },
        });

        const categoryCounts = transactions.reduce((counts, t) => {
            counts[t.category] = (counts[t.category] || 0) + 1;
            return counts;
        }, {});

        res.status(200).send(categoryCounts);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch pie chart data', details: error.message });
    }
});

router.get('/combined', async (req, res) => {
    try {
        const [transactions, statistics, barChart, pieChart] = await Promise.all([
            axios.get(`${BASE_URL}/transactions`, { params: req.query }),
            axios.get(`${BASE_URL}/statistics`, { params: req.query }),
            axios.get(`${BASE_URL}/bar-chart`, { params: req.query }),
            axios.get(`${BASE_URL}/pie-chart`, { params: req.query }),
        ]);

        res.status(200).send({
            transactions: transactions.data,
            statistics: statistics.data,
            barChart: barChart.data,
            pieChart: pieChart.data,
        });
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch combined data', details: error.message });
    }
});


module.exports = router