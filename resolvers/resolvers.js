const User = require("../models/User");
const { generateToken, hashPassword, comparePasswords } = require("../auth");

module.exports = {
	Query: {
		async getUsers(_, { amount }) {
			return await User.find().sort({ createdAt: -1 }).limit(amount);
		},
	},
	Mutation: {
		async loginUser(_, { userName, password }) {
			const user = await User.findOne({ userName });
			if (!user) {
				throw new Error("User not found");
			}
			const isPasswordValid = await comparePasswords(password, user.password);
			if (!isPasswordValid) {
				throw new Error("Invalid password");
			}
			const token = generateToken(user);
			return { token };
		},

		async registerUser(
			_,
			{ userInput: { firstName, lastName, userName, password } }
		) {
			const existingUser = await User.findOne({ userName });
			if (existingUser) {
				throw new Error("Username already taken");
			}

			const hashedPassword = await hashPassword(password);

			const newUser = new User({
				firstName,
				lastName,
				userName,
				password: hashedPassword,
				createdAt: new Date().toISOString(),
			});

			const result = await newUser.save();

			const token = generateToken(result);
			return { token };
		},
	},
};
