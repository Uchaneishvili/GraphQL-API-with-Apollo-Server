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

	type GetUserList {
		nodes: [GetUsersPayload!]!
		totalCount: Int!
		totalSignInCount: Int!
	}

	type GetUsersPayload {
		id: ID!
		firstName: String
		lastName: String
		userName: String!
		createdAt: String!
		successedSignInCount: Int!
	}

	input UserInput {
		firstName: String
		lastName: String
		userName: String!
		password: String!
	}

	type Query {
		getUsers(page: Int!): GetUserList!
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
		successedSignInCount: Int!
	}

	type RegusterPayload {
		token: String!
		user: User!
	}

	type Subscription {
		userDetailsUpdated(id: ID!): User
	}
`;
