const express = require('express');
const { getAllTransactionsByUserId, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transaction.controller');

const transactionRouter = express.Router();

// transactionRouter.get('/:id',getTransactionById);
transactionRouter.get('/all',getAllTransactionsByUserId);
transactionRouter.post('/add',createTransaction);
transactionRouter.put('/update',updateTransaction);
transactionRouter.delete('/delete',deleteTransaction);

module.exports = transactionRouter