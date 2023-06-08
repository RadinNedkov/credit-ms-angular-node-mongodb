const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    customerName: {
        required: true,
        type: String
    },
    amount: {
        required: true,
        type: Number
    },
    period: {
        required: true,
        type: Number,
        min: [1, 'Minimum period is 1 month.'],
        max: [12, 'Maximum period is 12 months.']
    },
    installment: {
        required: true,
        type: Number
    },
    totalDue: {
        required: true,
        type: Number
    }
})

module.exports = mongoose.model('Data', dataSchema)