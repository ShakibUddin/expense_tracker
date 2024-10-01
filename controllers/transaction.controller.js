const { getErrorResponse, getSuccessResponse } = require("../utils/responseHandlers");
const { Transaction } = require("../models/transaction.model");

module.exports = {
    getAllTransactionsByUserId: async (request, response) => {
        try {
            const currentUser = request.user;
            if (!(request.query?.page && request.query?.perPage)) return getErrorResponse({ response, code: 400, message: "Missing required parameters" });
            if (Number(request.query?.page) === 0 || Number(request.query?.perPage) === 0) return getErrorResponse({ response, code: 400, message: "Invalid parameters" });
            
            const { page, perPage } = request.query;
            const transaction = new Transaction();
            
            const totalTransactionsOfCurrentUser = await transaction.getTotalTransactionsByUserId(currentUser.id);            
            const paginatedTransactionsOfCurrentUser = await transaction.getTransactionsByUserId({ userId: String(currentUser.id), page, perPage });

            return getSuccessResponse({
                response,
                code: 200,
                message: `Transactions found for ${currentUser.username}`,
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
};