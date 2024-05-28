const { ApolloServer, ApolloError } = require("apollo-server");
const typeDefs = require("./typeDefs/typeDefs");
const resolvers = require("./resolvers/resolvers");
const jwt = require("jsonwebtoken");
const logger = require("./utils/logger");
require("dotenv").config();

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: async ({ req }) => {
		const tokenString = req.headers.authorization || "";
		const token = tokenString.split(" ")[1];

		if (!token) {
			return {};
		}
		try {
			const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
			return { user: decodedToken, token: token };
		} catch (error) {
			throw new ApolloError("Authentication failed", "UNAUTHENTICATED");
		}
	},
});

server
	.listen({ port: "5000" })
	.then(({ url }) => {
		logger.info(`Server running at ${url}`);
	})
	.catch((err) => {
		logger.error("Failed to start server:", err);
		process.exit(1);
	});
