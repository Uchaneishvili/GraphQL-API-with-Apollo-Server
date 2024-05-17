const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const secretKey =
	"c9b8e7c3c9e8d7c2c6d5b4a3928170685f4e3d2c1b0a09786756453412101f0e";

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
