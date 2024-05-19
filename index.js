const { ApolloServer } = require("apollo-server");
const typeDefs = require("./typeDefs/typeDefs");
const resolvers = require("./resolvers/resolvers");

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
