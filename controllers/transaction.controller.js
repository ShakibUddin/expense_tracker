const { getErrorResponse, getSuccessResponse } = require("../utils/responseHandlers");
const { Transaction } = require("../models/transaction.model");

module.exports = {
    getAllTransactionsByUserId: async (request, response) => {
        try {
            const currentUser = request.user;
            
            const { page, perPage, searchKey, categoryId, startDateTime, endDateTime, orderBy, order } = request.query;
            const transaction = new Transaction();

            if((startDateTime && !endDateTime) || (!startDateTime && endDateTime))return getErrorResponse({ response, code: 400, message: "Missing required parameters" });
            if((orderBy && !order) || (!orderBy && order))return getErrorResponse({ response, code: 400, message: "Missing required parameters" });
            if (!(page && perPage)) return getErrorResponse({ response, code: 400, message: "Missing required parameters" });
            if (Number(page) === 0 || Number(perPage) === 0) return getErrorResponse({ response, code: 400, message: "Invalid parameters" });

            const totalTransactionsOfCurrentUser = await transaction.getTotalTransactionsByUserId({userId: currentUser.id, searchKey, categoryId, startDateTime, endDateTime});
            const paginatedTransactionsOfCurrentUser = await transaction.getTransactionsByUserId({ userId: String(currentUser.id), page, perPage, searchKey, categoryId, startDateTime, endDateTime, orderBy, order });

            return getSuccessResponse({
                response,
                code: 200,
                message: 'Transactions fetched successfully.',
                data: {
                    page: Number(page),
                    per_page: Number(perPage),
                    total: totalTransactionsOfCurrentUser.totalTransactions,
                    data: paginatedTransactionsOfCurrentUser
                }
            });

        } catch (err) {
            console.log("error", err.message);
            return getErrorResponse({ response, code: 500, message: "Something went wrong!" });
        }
    },
    getExpenseByTimeFrame: async (request, response) => {
        try {
            const currentUser = request.user;
            
            const transaction = new Transaction();

            const expenseByTimeFrameOfCurrentUser = await transaction.fetchExpensesByTimeframe({ userId: String(currentUser.id)});

            console.log("expenseByTimeFrameOfCurrentUser",expenseByTimeFrameOfCurrentUser);
            
            return getSuccessResponse({
                response,
                code: 200,
                message: 'Transactions fetched successfully.',
                data: {
                    expenseCurrentDay: parseFloat(expenseByTimeFrameOfCurrentUser?.expenseCurrentDay),
                    expenseCurrentWeek: parseFloat(expenseByTimeFrameOfCurrentUser?.expenseCurrentWeek),
                    expenseCurrentMonth: parseFloat(expenseByTimeFrameOfCurrentUser?.expenseCurrentMonth),
                    expenseCurrentYear: parseFloat(expenseByTimeFrameOfCurrentUser?.expenseCurrentYear)
                  }
            });

        } catch (err) {
            console.log("error", err.message);
            return getErrorResponse({ response, code: 500, message: "Something went wrong!" });
        }
    },
    createTransaction: async (request, response) => {
        try {
            const currentUser = request.user;
            const { title, price, description, categoryId, unit } = request.body;

            if (!(title && price && description && categoryId && unit)) return getErrorResponse({ response, code: 400, message: "Missing required parameters" });

            const transaction = new Transaction();

            // check if the category id is valid

            // create the transaction
            const newTransaction = await transaction.createTransaction({ userId: currentUser.id, title, price, description, categoryId, unit });

            return getSuccessResponse({
                response,
                code: 201,
                message: `Transaction created successfully`,
                data: {
                    id: newTransaction.insertId,
                    title, price, description, categoryId, unit
                }
            });

        } catch (err) {
            console.log("error", err.message);
            return getErrorResponse({ response, code: 500, message: "Something went wrong!" });
        }
    },
    updateTransaction: async (request, response) => {
        try {
            const currentUser = request.user;
            const { title, price, description, categoryId, unit } = request.body;
            const { id } = request.query;

            if (!(id && title && price && description && categoryId && unit)) return getErrorResponse({ response, code: 400, message: "Missing required parameters" });

            const transaction = new Transaction();

            // check if any transaction exists with the transaction id 
            const existingTransaction = await transaction.getTransactionById(id);
            if (existingTransaction) {

                // check if the transaction was created by the currentUser
                if (existingTransaction.user_id === currentUser.id) {
                    // update the transaction
                    await transaction.updateTransaction({ transactionId: id, title, price, description, categoryId, unit });
                    return getSuccessResponse({
                        response,
                        code: 200,
                        message: `Transaction updated successfully`,
                        data: {
                            id: parseInt(id), userId: currentUser.id, title, price, description, categoryId, unit
                        }
                    });
                }
                else {
                    return getErrorResponse({ response, code: 403, message: `Unauthorized request` });
                }

            }
            else {
                return getErrorResponse({ response, code: 400, message: `No transaction with id ${id}` });
            }




        } catch (err) {
            console.log("error", err.message);
            return getErrorResponse({ response, code: 500, message: "Something went wrong!" });
        }
    },
    deleteTransaction: async (request, response) => {
        try {
            const currentUser = request.user;
            const { id } = request.query;

            if (!id) return getErrorResponse({ response, code: 400, message: "Missing required parameters" });

            const transaction = new Transaction();

            // check if any transaction exists with the transaction id 
            const existingTransaction = await transaction.getTransactionById(id);
            if (existingTransaction) {

                // check if the transaction was created by the currentUser
                if (existingTransaction.user_id === currentUser.id) {
                    // update the transaction
                    await transaction.deleteTransaction({ transactionId: id});
                    return getSuccessResponse({
                        response,
                        code: 200,
                        message: `Transaction is deleted successfully`,
                        data: null
                    });
                }
                else {
                    return getErrorResponse({ response, code: 403, message: `Unauthorized request` });
                }
            }
            else {
                return getErrorResponse({ response, code: 404, message: `No transaction with id ${id}` });
            }
        } catch (err) {
            console.log("error", err.message);
            return getErrorResponse({ response, code: 500, message: "Something went wrong!" });
        }
    },
};