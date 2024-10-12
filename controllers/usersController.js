import bcrypt from "bcrypt";
import "dotenv/config";
import fs from "fs/promises";
import gravatar from "gravatar";
import { Jimp } from "jimp";
import jwt from "jsonwebtoken";
import path from "path";
import { User } from "../models/usersModel.js";
import {
  signupValidation,
  subscriptionValidation,
} from "../validation/validation.js";

const { SECRET_KEY } = process.env;

const signupUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = signupValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in Use" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email, { protocol: "http" });

    const newUser = await User.create({
      email,
      password: hashPassword,
      avatarURL,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { error } = signupValidation.validate(req.body);
    if (error) {
      return res.status(401).json({ message: error.message });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { _id } = req.user;

    await User.findByIdAndUpdate(_id, { token: "" });
    res.status(204).json({});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCurrentUsers = async (req, res) => {
  try {
    const { email, subscription } = req.user;
    res.json({
      email,
      subscription,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserSubscription = async (req, res) => {
  try {
    const { error } = subscriptionValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const { _id } = req.user;
    const updatedUser = await User.findByIdAndUpdate(_id, req.body, {
      new: true,
    });

    res.json({
      email: updatedUser.email,
      subscription: updatedUser.subscription,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { _id } = req.user;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { path: oldPath, originalname } = req.file;

    await Jimp.read(oldPath)
      .then((image) => {
        image.resize({ w: 250, h: 250 }).write(oldPath);
      })
      .catch((error) => {
        throw new Error(error);
      });

    const extension = path.extname(originalname);
    const filename = `${_id}${extension}`;

    const newPath = path.join("public", "avatars", filename);
    await fs.rename(oldPath, newPath);

    const avatarURL = path.join("/avatars", filename);
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.status(200).json({ avatarURL });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getCurrentUsers,
  loginUser,
  logoutUser,
  signupUser,
  updateAvatar,
  updateUserSubscription,
};
