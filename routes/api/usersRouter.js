import express from "express";
import {
  getCurrentUsers,
  loginUser,
  logoutUser,
  signupUser,
  updateAvatar,
  updateUserSubscription,
} from "../../controllers/usersController.js";
import { authenticateToken } from "../../middlewares/auth.js";
import { upload } from "../../middlewares/upload.js";

const router = express.Router();

/* POST: // http://localhost:3000/api/users/signup */
router.post("/signup", signupUser);

/* POST: // http://localhost:3000/api/users/login */
router.post("/login", loginUser);

/* POST: // http://localhost:3000/api/users/logout */
router.post("/logout", authenticateToken, logoutUser);

/* GET: // http://localhost:3000/api/users/current */
router.get("/current", authenticateToken, getCurrentUsers);

/* PATCH: // http://localhost:3000/api/users/ */
router.patch("/", authenticateToken, updateUserSubscription);

/* PATCH: // http://localhost:3000/api/users/avatars */
router.patch(
  "/avatars",
  authenticateToken,
  upload.single("avatar"),
  updateAvatar
);

export { router };
