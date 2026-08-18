import Users from "../models/User.js";
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || username.length < 6) {
            return res.status(400).json({ message: "username should be at least 6 characters" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "please give a valid email" });
        }

        const existuser = await Users.findOne({ email });
        if (existuser) {
            return res.status(400).json({ message: "this email already exists" });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ message: "password should be more than 8 characters" });
        }

        const HashPassword = await bcrypt.hash(password, 10);

        const createUsers = await Users.create({
            username,
            email,
            password: HashPassword
        });

        const token = jwt.sign(
            { id: createUsers._id, email: createUsers.email },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );

        return res.status(201).json({
            message: "user created successfully",
            success: true,
            token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "failed to register user" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const Loginuser = await Users.findOne({ email });
        if (!Loginuser) {
            return res.status(400).json({ message: "email does not exist" });
        }

        const ispassword = await bcrypt.compare(password, Loginuser.password);
        if (!ispassword) {
            return res.status(400).json({ message: "please enter the right password" });
        }

        const token = jwt.sign(
            { id: Loginuser._id, email: Loginuser.email },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "login successfully",
            success: true,
            token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "login failed" });
    }
};