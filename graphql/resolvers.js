const User = require("../models/User");

module.exports = {
	Query: {
		async getUsers(_, { amount }) {
			return await User.find().sort({ createdAt: -1 }).limit(amount);
		},
	},
	Mutation: {
		async createUser(
			_,
			{ userInput: { firstName, lastName, userName, password } }
		) {
			const createdUser = new User({
				firstName,
				lastName,
				userName,
				password,
				createdAt: new Date().toISOString(),
			});

			const res = await createdUser.save();
			console.log(res._doc);
			return {
				_id: res.id,
				...res._doc,
			};
		},
	},
};
