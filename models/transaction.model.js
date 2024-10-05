const { db } = require("../database");

class Transaction {
    constructor() { }

    async getTotalTransactionsByUserId({ userId, searchKey, categoryId, startDateTime, endDateTime }) {
        let query = `SELECT COUNT(id) as totalTransactions FROM transactions WHERE user_id=?`;
        const params = [userId]
        if (searchKey) {
            query += ` AND (title LIKE ? or description LIKE ?)`;
            params.push(`%${searchKey.toLowerCase()}%`, `%${searchKey.toLowerCase()}%`)
        }
        if (categoryId) {
            query += ` AND category_id=?`;
            params.push(categoryId)
        }
        // filtering by date and time both
        if (startDateTime && endDateTime) {
            query += ` AND created_at BETWEEN ? AND ?`;
            params.push(startDateTime, endDateTime)
        }
        const [results] = await db.execute(query, params);
        return results[0];
    }

    async getTransactionsByUserId({ userId, page, perPage, searchKey, categoryId, startDateTime, endDateTime }) {
        const offset = String(Number(page) === 1 ? 0 : (Number(page) - 1) * Number(perPage));

        // base query
        let query = `SELECT transactions.*, categories.title as category 
                     FROM transactions 
                     INNER JOIN categories ON categories.id = transactions.category_id 
                     WHERE transactions.user_id = ?`;
        const params = [userId];

        if (searchKey) {
            query += ` AND (transactions.title LIKE ? OR transactions.description LIKE ?)`;
            params.push(`%${searchKey.toLowerCase()}%`, `%${searchKey.toLowerCase()}%`);
        }

        if (categoryId) {
            query += ` AND transactions.category_id = ?`;
            params.push(categoryId);
        }
        // filtering by date and time both
        if (startDateTime && endDateTime) {
            query += ` AND transactions.created_at BETWEEN ? AND ?`;
            params.push(startDateTime, endDateTime)
        }
        query += ` LIMIT ? OFFSET ?`;
        params.push(perPage, offset);

        const [results] = await db.execute(query, params);
        return results;
    }



    async getTransactionById(transactionId) {
        const [results] = await db.execute(
            `SELECT * FROM transactions WHERE id=?`,
            [transactionId]
        );
        return results[0];
    }

    async createTransaction({
        userId,
        title,
        price,
        description,
        categoryId,
        unit,
    }) {
        const [results] = await db.execute(
            `INSERT INTO transactions(user_id, title, price, description, category_id, unit) VALUES(?,?,?,?,?,?)`,
            [userId, title, price, description, categoryId, unit]
        );
        return results;
    }

    async updateTransaction({
        transactionId,
        title,
        price,
        description,
        categoryId,
        unit,
    }) {
        await db.execute(
            `UPDATE transactions SET title=?, price=?, description=?, category_id=?, unit=? WHERE id=?`,
            [title, price, description, categoryId, unit, transactionId]
        );
    }

    async deleteTransaction({ transactionId }) {
        await db.execute(`DELETE FROM transactions WHERE id=?`, [
            transactionId,
        ]);
    }
}

module.exports = { Transaction };
