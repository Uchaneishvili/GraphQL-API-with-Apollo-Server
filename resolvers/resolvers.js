const db = require("../database");
const { generateToken, hashPassword, comparePasswords } = require("../auth");

module.exports = {
	Query: {
		async getUsers(_, { amount }) {
			return new Promise((resolve, reject) => {
				const query = "SELECT * FROM Users ORDER BY createdAt DESC LIMIT ?";
				db.all(query, [amount], (err, rows) => {
					if (err) {
						reject(err);
					} else {
						resolve(rows);
					}
				});
			});
		},
	},
	Mutation: {
		async loginUser(_, { userName, password }) {
			return new Promise((resolve, reject) => {
				const query = "SELECT * FROM Users WHERE userName = ?";
				db.get(query, [userName], async (err, row) => {
					if (err) {
						reject(err);
					} else if (!row) {
						reject(new Error("User not found"));
					} else {
						const isPasswordValid = await comparePasswords(
							password,
							row.password
						);
						if (!isPasswordValid) {
							reject(new Error("Invalid password"));
						} else {
							const token = generateToken(row);
							resolve({ token });
						}
					}
				});
			});
		},
		async registerUser(
			_,
			{ userInput: { firstName, lastName, userName, password } }
		) {
			return new Promise((resolve, reject) => {
				const checkUserQuery = "SELECT * FROM Users WHERE userName = ?";
				db.get(checkUserQuery, [userName], async (err, row) => {
					if (err) {
						reject(err);
					} else if (row) {
						reject(new Error("Username already taken"));
					} else {
						const hashedPassword = await hashPassword(password);
						const createdAt = new Date().toISOString();
						const insertUserQuery =
							"INSERT INTO Users (firstName, lastName, userName, password, createdAt) VALUES (?, ?, ?, ?, ?)";
						db.run(
							insertUserQuery,
							[firstName, lastName, userName, hashedPassword, createdAt],
							function (err) {
								if (err) {
									reject(err);
								} else {
									const newUser = {
										id: this.lastID,
										firstName,
										lastName,
										userName,
										password: hashedPassword,
										createdAt,
									};
									const token = generateToken(newUser);
									resolve({ token });
								}
							}
						);
					}
				});
			});
		},
	},
};
