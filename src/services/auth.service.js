import User from "../models/User.js";
import jwt from "jsonwebtoken";

const loginService = (email) =>
  User.findOne({ email: email }).select("+password");

const generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

export { loginService, generateToken };
