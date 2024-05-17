const { gql } = require("apollo-server");

module.exports = gql`
	type User {
		_id: ID!
		firstName: String
		lastName: String
		userName: String!
		password: String!
		createdAt: String!
	}

	input UserInput {
		firstName: String
		lastName: String
		userName: String!
		password: String!
	}

	type Query {
		getUsers(amount: Int): [User]
	}

	type Mutation {
		loginUser(userName: String!, password: String!): AuthPayload
		registerUser(userInput: UserInput): AuthPayload!
	}

	type AuthPayload {
		token: String!
	}
`;
