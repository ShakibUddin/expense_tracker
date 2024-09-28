const { db } = require("../database");
const bcrypt = require("bcryptjs");

class User{
    constructor(){

    }

    async findUserByEmail(email){
        const [results] = await db.execute(`SELECT * FROM users where email=?`,[email]);
        return results;
    }

    async createUser({username, password, email}){
        const [results] = await db.execute(`INSERT INTO users(username, email, password) values(?,?,?)`,[username, email, await bcrypt.hash(password, 10)]);
        return results;
    }
}

module.exports = {User}