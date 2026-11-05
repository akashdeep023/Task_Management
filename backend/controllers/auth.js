const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwtProvider");

// Evita consultas con datos manipulados.
const validEmail = value => typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPassword = value => typeof value === "string" && value.length > 0;

const registerUser = async (req, res, next) => {
	let { name, email, password } = req.body || {};
	if (typeof name !== "string" || !name.trim() || !validEmail(email) || !validPassword(password)) {
		return res.status(400).json({ message: "Invalid registration data" });
	}
	const existingUser = await User.findOne({ email: email });
	if (existingUser) {
		return res.status(400).json({ message: `User Already Exist` });
	}
	password = bcrypt.hashSync(password, 8);
	const userData = new User({
		name,
		email,
		password,
	});
	const user = await userData.save();
	const jwt = generateToken(user._id);
	res.status(200).json({
		message: "Registration Successfully",
		token: jwt,
	});
};

const loginUser = async (req, res) => {
	let { email, password } = req.body || {};
	if (!validEmail(email) || !validPassword(password)) {
		return res.status(400).json({ message: "Invalid login data" });
	}
	let user = await User.findOne({ email: email });
	if (!user) {
		return res.status(404).json({ message: `User Not Found` });
	}
	const isPasswordValid = bcrypt.compareSync(password, user.password);
	if (!isPasswordValid) {
		return res.status(401).json({ message: "Incorrect Password" });
	}
	const jwt = generateToken(user._id);
	user.password = null;
	res.status(200).json({
		message: "Login Successfully",
		data: user,
		token: jwt,
	});
};

module.exports = { registerUser, loginUser };
