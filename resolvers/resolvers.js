const db = require("../database");
const { generateToken, hashPassword, comparePasswords } = require("../auth");
const jwt = require("jsonwebtoken");
const { ApolloError } = require("apollo-server");

const MAX_LOGIN_ATTEMPTS = 5; // Set the maximum number of allowed login attempts

module.exports = {
	Query: {
		async getUsers(_, { page }) {
			try {
				const offset = (page - 1) * 10;
				const query =
					"SELECT * FROM Users ORDER BY createdAt DESC LIMIT ? OFFSET ?";
				const rows = await new Promise((resolve, reject) => {
					db.all(query, [10, offset], (err, rows) => {
						if (err) {
							reject(err);
						} else {
							resolve(rows);
						}
					});
				});

				const countQuery = "SELECT COUNT(*) as totalCount FROM Users";
				const totalCount = await new Promise((resolve, reject) => {
					db.get(countQuery, (err, row) => {
						if (err) {
							reject(err);
						} else {
							resolve(row.totalCount);
						}
					});
				});

				const nodes = rows.map((row) => ({
					id: row.id,
					firstName: row.firstName,
					lastName: row.lastName,
					userName: row.userName,
					createdAt: row.createdAt,
					signInCount: row.signInCount,
				}));

				const getUserList = {
					nodes,
					totalCount,
				};

				return getUserList;
			} catch (err) {
				console.error("Error fetching users:", err);
				throw err;
			}
		},
	},
	Mutation: {
		async loginUser(_, { userName, password }) {
			try {
				const user = await new Promise((resolve, reject) => {
					const query = "SELECT * FROM Users WHERE userName = ?";
					db.get(query, [userName], (err, user) => {
						if (err) {
							reject(err);
						} else if (!user) {
							reject(new ApolloError("User not found"));
						} else {
							resolve(user);
						}
					});
				});

				const updateQuery =
					"UPDATE Users SET signInCount = signInCount + 1 WHERE id = ?";
				await new Promise((resolve, reject) => {
					db.run(updateQuery, [user.id], (err) => {
						if (err) {
							reject(
								new ApolloError(`Error updating login attempts: ${err.message}`)
							);
						} else {
							resolve();
						}
					});
				});

				// Check if the maximum number of login attempts has been reached
				if (user.signInCount >= MAX_LOGIN_ATTEMPTS) {
					throw new ApolloError("MAXIMUM_LOGIN_ATTEMPTS_REACHED");
				}

				const isPasswordValid = await comparePasswords(password, user.password);
				if (!isPasswordValid) {
					throw new ApolloError("INVALID_PASSWORD");
				}

				const token = generateToken(user);
				return {
					token,
					id: user.id,
					userName: user.userName,
					firstName: user.firstName,
					lastName: user.lastName,
					createdAt: user.createdAt,
				};
			} catch (error) {
				throw new ApolloError(
					`Error occurred while logging in user:, ${error}`
				);
			}
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
										id: this.lastID,
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
											id: this.lastID,
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
