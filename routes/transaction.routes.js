const express = require('express');
const { getAllTransactionsByUserId, createTransaction, updateTransaction, deleteTransaction, getExpenseByTimeFrame, getExpenseOfAllCategories } = require('../controllers/transaction.controller');

const transactionRouter = express.Router();

transactionRouter.get('/all',getAllTransactionsByUserId);
transactionRouter.post('/add',createTransaction);
transactionRouter.put('/update',updateTransaction);
transactionRouter.delete('/delete',deleteTransaction);
transactionRouter.get('/expenseByTimeFrame',getExpenseByTimeFrame);
transactionRouter.get('/expenseOfAllCategories',getExpenseOfAllCategories);

module.exports = transactionRouter