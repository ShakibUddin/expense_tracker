const express = require("express");
const { db } = require("./database");
const userRouter = require("./routes/user.routes");
const transactionRouter = require("./routes/transaction.routes");
const verifyToken = require("./middlewares/auth");
const categoryRouter = require("./routes/category.routes");
require("dotenv").config();

const app = express();

app.use(express.json());

app.use("/user", userRouter);
app.use("/transaction", verifyToken, transactionRouter);
app.use("/category", verifyToken, categoryRouter);

app.listen(process.env.PORT, async () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
    try {
        await db.getConnection();
        console.log(`Connection to database has been established successfully.`);
    } catch (error) {
        console.log("Unable to connect to the database:", error);
    }
});
