const { User } = require("../models/user.model");
const { getErrorResponse, getSuccessResponse } = require("../utils/responseHandlers");

module.exports = {
    createUser: async (request, response) => {
        try {
            const { username, email, password } = request.body;

            if (!(email && password && username)) {
                return getErrorResponse({ response, code: 400, message: "Missing required fields" });
            } else {
                const user = new User();
                const existingUser = await user.findUserByEmail(email);

                if (existingUser && existingUser.length === 0) {
                    const newUser = await user.createUser({
                        username,
                        email,
                        password,
                    });
                    return getSuccessResponse({
                        response,
                        code: 201,
                        message: "Registration is successful, Please login"
                    });
                }
                else if (existingUser && existingUser.length > 0) {
                    return getErrorResponse({ response, code: 409, message: "Email already exists" });
                }
            }
        } catch (err) {
            console.log("error", err.message);

            return getErrorResponse({ response, code: 500, message: "Something went wrong!" });
        }
    },
};