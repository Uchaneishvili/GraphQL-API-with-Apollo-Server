const { ApolloServer } = require("apollo-server");
const typeDefs = require("./typeDefs/typeDefs");
const resolvers = require("./resolvers/resolvers");
const jwt = require("jsonwebtoken");
const secretKey =
	"9d8e7d92b0f74c3c8d6d7a9e4f1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f";

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req }) => {
		const token = req.headers.authorization || "";
		if (token) {
			try {
				const user = jwt.verify(token, secretKey);
				return { user };
			} catch (error) {
				console.error("Invalid token:", error);
			}
		}
		return {};
	},
});

server.listen({ port: 5000 }).then(({ url }) => {
	console.log(`Server running at ${url}`);
});
