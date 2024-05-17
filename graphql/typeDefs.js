const { gql } = require("apollo-server");

module.exports = gql`
	type User {
		firstName: String
		lastName: String
		userName: String
		password: String
	}

	input UserInput {
		firstName: String
		lastName: String
		userName: String
		password: String
	}

	type Query {
		getUsers(amount: Int): [User]
	}

	type Mutation {
		createUser(userInput: UserInput): User!
	}
`;
