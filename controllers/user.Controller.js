const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const cloudinary = require("../configs/cloudinary");

require("dotenv").config();

exports.register = async (req, res) => {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
        return res.status(400).send({
            message: "Please provide Fullname , Email , and Password",
        });

    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        return res.status(400).send({
            message: "This Email is already laona existed",

        });

    }

    try {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const user = await UserModel.create({
            fullname,
            email,
            password: hashedPassword,
        });

        //save login in cookies
        if (user) { 
            const secret = process.env.SECRET;
            const node_mode = process.env.node_mode;
            const token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1d" });
            res.cookie("jwt", token, {
                httpOnly: true, // XSS ATTACK
                secure: node_mode !== "development",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000,
            });

            console.log("Token generated and cookie set")
        }
        res.status(201).send({
            message: "User registered successfully",
            user: user
        });
    } catch (error) {
        res.status(500).send({
            message:
                error.message || "Some error occured while registering the Fullname"
        });

    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({
            message: "Please Provide Email and Password",
        });
    }
    try {
        const userDoc = await UserModel.findOne({ email });
        if (!userDoc) {
            return res.status(404).send({ message: "email not found" });
        }
        const isPasswordMatched = bcrypt.compareSync(password, userDoc.password);
        if (!isPasswordMatched) {
            return res.status(401).send({ message: "Invalid Password" });
        }

        // login Successfully
        jwt.sign({ email, userId: userDoc._id }, secret, {}, (err, token) => {
            if (err) {
                return res.status(500).send({
                    message: "Internal server error : Authentication Failed",

                });
            }

            // Set Cookie
            const node_mode = process.env.node_mode;
            res.cookie("jwt", token, {
                httpOnly: true, // XSS ATTACK
                secure: node_mode !== "development",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000,
            });

            // token generation
            res.send({
                message: "Email User Login Succesfully",
                userId: userDoc._id,
                email: userDoc.email,
                accessToken: token,
            });
        });

    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occured while login"
        })
    }

};

exports.logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.send({ message: "Logout successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal server error while logging out" });
    }

};

exports.updateProfile = async (req, res) => {
    try {
        const { fullname, profilePicture } = req.body;
        const UserId = req.user._id;

        if (fullname && profilePicture) {
            const uploadResponse = await cloudinary.uploader.upload(profilePicture);
            if (!uploadResponse) {
                return res.status(500).json({ message: "Error while uploading profile picture" });
            }
            const updatedUser = await UserModel.findByIdAndUpdate(
                UserId,
                {
                    fullname: fullname,
                    profilePicture: uploadResponse.secure_url,
                },
                { new: true },
            );
            if (!updatedUser) {
                return res.status(500).json({ message: "Error While Update User Profile" });

            }
            res.status(200).json({ message: "User Profile Updated Successfully!", user: updatedUser });
        } else if (profilePicture) {
            const uploadResponse = await cloudinary.uploader.upload(profilePicture);
            if (!uploadResponse) {
                return res.status(500).json({ message: "Error while uploading profile picture" });
            }
            const updatedUser = await UserModel.findByIdAndUpdate(
                UserId,
                {
                    profilePicture: uploadResponse.secure_url,
                },
                { new: true },
            );
            if (!updatedUser) {
                return res.status(500).json({ message: "Error While Update User Profile" });

            }
            res.status(200).json({ message: "User Profile Updated Successfully!", user: updatedUser });
        } else if (fullname) {
            const updatedUser = await UserModel.findByIdAndUpdate(
                UserId,
                {
                    fullname: fullname,
                },
                { new: true },
            );
            if (!updatedUser) {
                return res.status(500).json({ message: "Error While Update User Profile" });
            }
            res.status(200).json({
                message: "User Profile Updated Successfully!",
                user: updatedUser,
            });
        } else {
            res.status(200).json({ message: "Nothing is updated" });
        }

    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ message: "Internal Server Error While Updating User Profile", error: error.message });
    }
};

exports.checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Error in checkAuth:", error.message);
        res.status(500).json({
            message: "Internal Server Error while checking authentication"
        });
    }
};
