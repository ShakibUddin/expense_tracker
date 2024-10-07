const { Category } = require("../models/category.model");
const { getErrorResponse, getSuccessResponse } = require("../utils/responseHandlers");

module.exports = {
    getAllCategories: async (request, response) => {
        try {
            const currentUser = request.user;
            
            const {searchKey} = request.query;
            const category = new Category();

            const categories = await category.getAllCategories({ userId: String(currentUser.id), searchKey});

            return getSuccessResponse({
                response,
                code: 200,
                message: 'Categories fetched successfully.',
                data: categories
            });

        } catch (err) {
            console.log("error", err.message);
            return getErrorResponse({ response, code: 500, message: "Something went wrong!" });
        }
    },

    createCategory: async (request, response) => {
        try {
            const currentUser = request.user;
            const { title} = request.body;

            if (!title ) return getErrorResponse({ response, code: 400, message: "Missing required parameters" });

            const category = new Category();

            // create the category
            await category.createCategory({ userId: currentUser.id, title });

            return getSuccessResponse({
                response,
                code: 201,
                message: `Category created successfully`,
                data: null
            });

        } catch (err) {
            console.log("error", err.message);
            return getErrorResponse({ response, code: 500, message: "Something went wrong!" });
        }
    },
    updateCategory: async (request, response) => {
        try {
            const currentUser = request.user;
            const { title } = request.body;
            const { id } = request.query;

            if (!(id && title)) return getErrorResponse({ response, code: 400, message: "Missing required parameters" });

            const category = new Category();

            // check if any category exists with the category id 
            const existingCategory = await category.getCategoryById(id);
            if (existingCategory) {
                // check if the category was created by the currentUser
                if (existingCategory.user_id === currentUser.id) {
                    // update the category
                    await category.updateCategory({ categoryId: id, title });
                    return getSuccessResponse({
                        response,
                        code: 200,
                        message: `Category updated successfully`,
                        data: null
                    });
                }
                else {
                    return getErrorResponse({ response, code: 403, message: `Access denied. You do not have permission to access this resource.` });
                }
            }
            else {
                return getErrorResponse({ response, code: 400, message: `No category with id ${id}` });
            }
        } catch (err) {
            console.log("error", err.message);
            return getErrorResponse({ response, code: 500, message: "Something went wrong!" });
        }
    },
    deleteCategory: async (request, response) => {
        try {
            const currentUser = request.user;
            const { id } = request.query;

            if (!id) return getErrorResponse({ response, code: 400, message: "Missing required parameters" });

            const category = new Category();

            // check if any category exists with the category id 
            const existingCategory = await category.getCategoryById(id);
            
            if (existingCategory) {
                // check if the category was created by the currentUser
                if (existingCategory.user_id === currentUser.id) {
                    // delete the category
                    await category.deleteCategory({ categoryId: id});
                    return getSuccessResponse({
                        response,
                        code: 200,
                        message: `Category is deleted successfully`,
                        data: null
                    });
                }
                else {
                    return getErrorResponse({ response, code: 403, message: `Access denied. You do not have permission to access this resource.` });
                }
            }
            else {
                return getErrorResponse({ response, code: 404, message: `No category with id ${id}` });
            }
        } catch (err) {
            console.log("error", err.message);
            return getErrorResponse({ response, code: 500, message: "Something went wrong!" });
        }
    },
};