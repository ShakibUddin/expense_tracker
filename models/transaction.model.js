const { db } = require("../database");

class Transaction {
    constructor() {

    }

    async getTotalTransactionsByUserId(userId) {        
        const [results] = await db.execute(`SELECT COUNT(id) as totalTransactions FROM transactions WHERE user_id=?`, [userId]);
        return results[0];
    }

    async getTransactionsByUserId({userId, page, perPage}) {
        const offset = String(Number(page) === 1 ? 0 : (Number(page) - 1) * Number(perPage))
        const [results] = await db.execute(
            `SELECT transactions.*, categories.title as category FROM transactions inner join categories on categories.id = transactions.category_id WHERE transactions.user_id = ? LIMIT ? OFFSET ?`,
            [userId, perPage, offset]
        );
        return results;
    }

    async getTransactionById(transactionId) {
        const [results] = await db.execute(`SELECT * FROM transactions WHERE id=?`, [transactionId]);
        return results[0];
    }

    async createTransaction({ userId, title, price, description, categoryId, unit }) {
        const [results] = await db.execute(`INSERT INTO transactions(user_id, title, price, description, category_id, unit) VALUES(?,?,?,?,?,?)`, [userId, title, price, description, categoryId, unit]);        
        return results;
    }

    async updateTransaction({ transactionId, title, price, description, categoryId, unit }) {
        const [results] = await db.execute(`UPDATE transactions SET title=?, price=?, description=?, category_id=?, unit=? WHERE id=?`, [title, price, description, categoryId, unit, transactionId]);
        console.log("results",results);
        
        return results;
    }

    async deleteTransaction({ transactionId }) {
        const [results] = await db.execute(`DELETE FROM transactions WHERE id=?`, [transactionId]);
        return results[0];
    }
}

module.exports = { Transaction }