const express = require('express');
const Credit = require('#models/credit');
const CONSTANTS = require('#config/constants');

const router = express.Router()

const getTotalAmount = (arrayOfObjects) => {
    let arrayOfNumbers = []
    arrayOfObjects.forEach(object => arrayOfNumbers.push(object.amount))
    const sum = arrayOfNumbers.reduce((a, b) => a + b)
    return sum
}

router.post('/credits', async(req, res) => {
    const data = new Credit({
        customerName: req.body.customerName,
        amount: req.body.amount,
        period: req.body.period,
        installment: req.body.amount / req.body.period,
        totalDue: req.body.amount
    })

    const credits = await Credit.find({ customerName: req.body.customerName })
        .select('amount')
        .exec()
    if (credits.length > 0) {
        const totalAmount = getTotalAmount(credits)
        if ((totalAmount + data.amount) > CONSTANTS.CREDIT_LIMIT) {
            return res.status(400).json({ error: `Your credit limit is ${CONSTANTS.CREDIT_LIMIT} BGN and the requested amount can't be approved.` })
        }
    }

    data.save()
        .then(result => {
            res.status(200).json('Credit successfully created with id: ' + result._id)
        })
        .catch(error => {
            res.status(400).json({ error: error.message })
        })
})

router.get('/credits', (req, res) => {
    Credit.find()
        .select('_id customerName amount period installment period totalDue')
        .exec()
        .then(data => {
            const response = {
                count: data.length,
                credits: data
            }
            res.status(200).json(response)
        })
        .catch(error => {
            res.status(500).json({ error: error.message })
        })
})

router.get('/credits/:id', (req, res) => {
    Credit.findById(req.params.id)
        .select('_id customerName amount period installment period totalDue')
        .exec()
        .then(data => {
            res.status(200).json(data)
        })
        .catch(error => {
            res.status(500).json({ message: error.message })
        })
})

router.patch('/credits/update/:id', async(req, res) => {
    const id = req.params.id
    const payment = req.body.payment
    let notification = ''
    const options = { new: true }
    const credit = await Credit.findById(req.params.id)
        .exec()

    if (payment > credit.totalDue) {
        notification = `You have an overpayment of ${payment - credit.totalDue} BGN, which is refunded!`
        credit.totalDue = 0
    } else {
        credit.totalDue -= payment
    }

    Credit.findByIdAndUpdate(
            id, credit, options
        )
        .then(data => {
            res.status(200).json({ credit: data, message: notification })
        })
        .catch(error => {
            res.status(500).json({ message: error.message })
        })
})

router.delete('/credits/delete/:id', (req, res) => {
    const id = req.params.id;
    Credit.findByIdAndDelete(id)
        .then(data => {
            res.send(`Credit ${data._id} has been deleted..`)
        })
        .catch(error => {
            res.status(500).json({ message: error.message })
        })
})

module.exports = router;