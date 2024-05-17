const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");

const MONGODB =
	"mongodb+srv://guchaneishvili:guchaneishvili@pulsarai.adr3zva.mongodb.net/?retryWrites=true&w=majority&appName=PulsarAI";

// Apollo Server
// TypeDefs : GraphQL Type Definition
// resolvers: How od we resolve queries / mutation

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

mongoose
	.connect(MONGODB, { useNewUrlParser: true })
	.then(() => {
		console.log("MongoDB Connection Successfull");
		return server.listen({ port: 5000 });
	})
	.then((res) => {
		console.log(`Server running at ${res.url}`);
	});
