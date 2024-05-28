const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (user) => {
	return jwt.sign(
		{ userId: user._id, userName: user.userName },
		process.env.TOKEN_SECRET_KEY,
		{
			expiresIn: "24h",
		}
	);
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
