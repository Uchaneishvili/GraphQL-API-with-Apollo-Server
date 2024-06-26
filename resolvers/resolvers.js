const db = require("../database");
const { generateToken, hashPassword, comparePasswords } = require("../auth");
const jwt = require("jsonwebtoken");
const { ApolloError } = require("apollo-server");
const authenticateUser = require("../utils/authUtils");

const MAX_LOGIN_ATTEMPTS = 5;
module.exports = {
	Query: {
		getUsers: authenticateUser()(async (_, { page }) => {
			try {
				const offset = (page - 1) * 5;
				const query =
					"SELECT * FROM Users ORDER BY createdAt DESC LIMIT ? OFFSET ?";
				const rows = await new Promise((resolve, reject) => {
					db.all(query, [5, offset], (err, rows) => {
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
					successedSignInCount: row.successedSignInCount,
				}));

				const signCountQuery =
					"SELECT SUM(successedSignInCount) as sum FROM Users";
				const totalSignInCount = await new Promise((resolve, reject) => {
					db.get(signCountQuery, (err, count) => {
						if (err) {
							reject(err);
						} else {
							resolve(count.sum);
						}
					});
				});

				const getUserList = {
					nodes,
					totalCount,
					totalSignInCount,
				};

				return getUserList;
			} catch (err) {
				throw new ApolloError("Error fetching users:", err);
			}
		}),
	},
	Mutation: {
		loginUser: async (_, { userName, password }) => {
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

				if (user.signInCount >= MAX_LOGIN_ATTEMPTS) {
					throw new ApolloError("MAXIMUM_LOGIN_ATTEMPTS_REACHED");
				}

				const isPasswordValid = await comparePasswords(password, user.password);

				if (!isPasswordValid) {
					const updateQuery = `UPDATE Users SET signInCount = signInCount + 1 WHERE id = ?;`;

					await new Promise((resolve, reject) => {
						db.run(updateQuery, [user.id], (err) => {
							if (err) {
								reject(
									new ApolloError(
										`Error updating login attempts: ${err.message}`
									)
								);
							} else {
								resolve();
							}
						});
					}).then(() => {
						throw new ApolloError("INVALID_PASSWORD");
					});
				}

				const token = generateToken(user);

				const updateQuery = `UPDATE Users SET successedSignInCount = successedSignInCount + 1, signInCount = 0 WHERE id = ?;`;

				if (token) {
					await new Promise((resolve, reject) => {
						db.run(updateQuery, [user.id], (err) => {
							if (err) {
								reject(
									new ApolloError(
										`Error updating login attempts: ${err.message}`
									)
								);
							} else {
								resolve();
							}
						});
					});
				}

				return {
					token,
					id: user.id,
					userName: user.userName,
					firstName: user.firstName,
					lastName: user.lastName,
					createdAt: user.createdAt,
					successedSignInCount: user.successedSignInCount,
				};
			} catch (error) {
				throw new ApolloError(`Error occurred while logging in user: ${error}`);
			}
		},
		refreshToken: async (_, { refreshToken }) => {
			return new Promise((resolve, reject) => {
				try {
					const decoded = jwt.verify(
						refreshToken,
						process.env.REFRESH_TOKEN_SECRET
					);
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
						reject(new Error("USERNAME_ALREADY_EXISTS"));
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
