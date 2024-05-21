const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const secretKey = "my-32-character-ultra-secure-and-ultra-long-secret";

const generateToken = (user) => {
	return jwt.sign({ userId: user._id, userName: user.userName }, secretKey, {
		expiresIn: "1h",
	});
};

const hashPassword = async (password) => {
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(password, salt);
};

const comparePasswords = async (password, hashedPassword) => {
	return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
	generateToken,
	hashPassword,
	comparePasswords,
};
