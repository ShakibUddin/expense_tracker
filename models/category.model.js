const { db } = require("../database");

class Category {
    constructor() { }

    async getAllCategories({ userId, searchKey=null }) {
        let query = `SELECT * FROM categories WHERE user_id = ? OR user_id is null`;
        const params = [userId];

        if(searchKey){
            query += ` AND title LIKE ?`;
            params.push(`%${searchKey}%`)
        }
        const [results] = await db.execute(query, params);
        return results;
    }

    async getCategoryById(categoryId) {
        const [results] = await db.execute(
            `SELECT * FROM categories WHERE id=?`,
            [categoryId]
        );
        return results[0];
    }

    async createCategory({
        userId,
        title
    }) {
        const [results] = await db.execute(
            `INSERT INTO categories(user_id, title) VALUES(?,?)`,
            [userId, title]
        );
        return results;
    }

    async updateCategory({
        categoryId,
        title
    }) {
        
        await db.execute(
            `UPDATE categories SET title=? WHERE id=?`,
            [title, categoryId]
        );
    }

    async deleteCategory({ categoryId }) {
        await db.execute(`DELETE FROM categories WHERE id=?`, [
            categoryId,
        ]);
    }
}

module.exports = { Category };
