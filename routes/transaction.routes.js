const express = require('express');
const { getAllTransactionsByUserId } = require('../controllers/transaction.controller');

const transactionRouter = express.Router();

// transactionRouter.get('/:id',getTransactionById);
transactionRouter.get('/all',getAllTransactionsByUserId);
// transactionRouter.post('/add',createTransaction);
// transactionRouter.put('/update/:id',updateTransaction);
// transactionRouter.delete('/delete/:id',deleteTransaction);

module.exports = transactionRouter