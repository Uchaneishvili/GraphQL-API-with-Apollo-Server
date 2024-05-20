const { gql } = require("apollo-server");

module.exports = gql`
	type User {
		id: ID!
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
		loginUser(userName: String!, password: String!): LoginPayload
		registerUser(userInput: UserInput): RegusterPayload!
		refreshToken(refreshToken: String!): AuthPayload
	}

	type AuthPayload {
		token: String!
	}

	type LoginPayload {
		token: String!
		id: ID!
		userName: String!
		firstName: String!
		lastName: String!
		createdAt: String!
	}

	type RegusterPayload {
		token: String!
		user: User!
	}
`;
