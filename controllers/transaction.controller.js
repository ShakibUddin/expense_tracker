const { getErrorResponse, getSuccessResponse } = require("../utils/responseHandlers");
const { Transaction } = require("../models/transaction.model");

module.exports = {
    getAllTransactionsByUserId: async (request, response) => {
        try {
            const currentUser = request.user;
            if (!(request.query?.page && request.query?.perPage)) return getErrorResponse({ response, code: 400, message: "Missing required parameters" });
            if (Number(request.query?.page) === 0 || Number(request.query?.perPage) === 0) return getErrorResponse({ response, code: 400, message: "Invalid parameters" });

            const { page, perPage, searchKey, categoryId, startDateTime, endDateTime } = request.query;
            const transaction = new Transaction();

            if(startDateTime && !endDateTime)return getErrorResponse({ response, code: 400, message: "Missing required parameters" });

            const totalTransactionsOfCurrentUser = await transaction.getTotalTransactionsByUserId({userId: currentUser.id, searchKey, categoryId, startDateTime, endDateTime});
            const paginatedTransactionsOfCurrentUser = await transaction.getTransactionsByUserId({ userId: String(currentUser.id), page, perPage, searchKey, categoryId, startDateTime, endDateTime });

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
    createTransaction: async (request, response) => {
        try {
            const currentUser = request.user;
            const { title, price, description, categoryId, unit } = request.body;

            if (!(title && price && description && categoryId && unit)) return getErrorResponse({ response, code: 400, message: "Missing required parameters" });

            const transaction = new Transaction();

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