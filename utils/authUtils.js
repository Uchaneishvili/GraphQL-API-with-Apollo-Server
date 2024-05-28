const jwt = require("jsonwebtoken");
const { ApolloError } = require("apollo-server");
require("dotenv").config();

const authenticateUser = () => {
	return (resolverFunction) => async (root, args, context, info) => {
		const token = context?.token;

		if (!token) {
			throw new ApolloError("Authentication required", "UNAUTHENTICATED");
		}

		try {
			const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
			context.user = decoded;
		} catch (error) {
			throw new ApolloError("Invalid token", "INVALID_TOKEN");
		}

		return resolverFunction(root, args, context, info);
	};
};

module.exports = authenticateUser;
