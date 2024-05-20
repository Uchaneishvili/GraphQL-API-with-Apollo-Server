const db = require("../database");
const { generateToken, hashPassword, comparePasswords } = require("../auth");
const jwt = require("jsonwebtoken");

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
							resolve({
								token,
								id: row.id,
								userName: row.userName,
								firstName: row.firstName,
								lastName: row.lastName,
								createdAt: row.createdAt,
							});
						}
					}
				});
			});
		},

		async refreshToken(_, { refreshToken }) {
			return new Promise((resolve, reject) => {
				try {
					const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
					const userId = decoded.id;
					const query = "SELECT * FROM Users WHERE _id = ?";
					db.get(query, [userId], (err, row) => {
						if (err) {
							reject(err);
						} else if (!row) {
							reject(new Error("User not found"));
						} else {
							const token = generateToken(row);
							resolve({ token });
						}
					});
				} catch (error) {
					reject(error);
				}
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
										_id: this.lastID,
										firstName,
										lastName,
										userName,
										password: hashedPassword,
										createdAt,
									};
									const token = generateToken(newUser);
									resolve({
										token,
										user: {
											_id: this.lastID,
											firstName,
											lastName,
											password: hashedPassword,
											userName,
										},
									});
								}
							}
						);
					}
				});
			});
		},
	},
};
