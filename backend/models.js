const mongoose = require('mongoose');

const ProductTransactionSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    price: Number,
    dateOfSale: Date,
    category: String,
    sold: Boolean,
    image: String,
});

module.exports = {
    'Transactions': mongoose.model('transactions', ProductTransactionSchema)
}
