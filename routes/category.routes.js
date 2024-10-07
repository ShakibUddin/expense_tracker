const express = require('express');
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');

const categoryRouter = express.Router();

categoryRouter.get('/all',getAllCategories);
categoryRouter.post('/add',createCategory);
categoryRouter.put('/update',updateCategory);
categoryRouter.delete('/delete',deleteCategory);

module.exports = categoryRouter