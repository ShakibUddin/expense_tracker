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

    async getTransactionsByUserId({ userId, page, perPage, searchKey, categoryId, startDateTime, endDateTime, orderBy, order }) {
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

        if (orderBy && order) {
            const validOrders = ['ASC', 'DESC'];
            // Ensure that order can only be ASC or DESC to avoid potential issues or SQL injection risks
            if (!validOrders.includes(order.toUpperCase())) {
                throw new Error("Invalid order direction");
            }

            // Escapes the column name to prevent SQL injection and ensure it's treated as an identifier
            query += ` ORDER BY ${db.escapeId(orderBy)} ${order.toUpperCase()}`;
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

    async fetchExpensesByTimeframe({ userId }) {
        // This will return expenses for today. CURDATE() returns the current date, and DATE() ensures we're comparing only the date part
        const [expenseCurrentDay] = await db.execute(`Select SUM(price) as total from transactions WHERE user_id=? AND DATE(created_at) = CURDATE()`, [userId])
        // This query will return expenses for the current week. YEARWEEK() takes two arguments: the date column and the mode (with 1 starting the week on Monday). It compares the current week's number to the created_at
        const [expenseCurrentWeek] = await db.execute(`Select SUM(price) as total from transactions WHERE user_id=? AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)`, [userId])
        const [expenseCurrentMonth] = await db.execute(`Select SUM(price) as total from transactions WHERE user_id=? AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`, [userId])
        const [expenseCurrentYear] = await db.execute(`Select SUM(price) as total from transactions WHERE user_id=? AND YEAR(created_at) = YEAR(CURDATE())`, [userId])

        return { expenseCurrentDay: expenseCurrentDay[0]?.total, expenseCurrentWeek: expenseCurrentWeek[0]?.total, expenseCurrentMonth: expenseCurrentMonth[0]?.total, expenseCurrentYear: expenseCurrentYear[0]?.total }
    }
}

module.exports = { Transaction };
