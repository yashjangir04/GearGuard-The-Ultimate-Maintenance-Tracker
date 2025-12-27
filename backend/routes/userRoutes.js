import express from "express";
import { 
  createUser, 
  loginUser, 
  logoutCurrentUser, 
  getAllUsers, 
  userCurrentProfile, 
  updateCurrentProfile,
  deleteUserById,
  getUserById,
  updateUserById
} from "../controllers/UserController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router= express.Router();

router.route("/")
  .post(createUser)
  .get(authenticate, authorizeAdmin, getAllUsers);

router.post("/auth", loginUser);
router.post("/logout", logoutCurrentUser);

router.route("/profile")
  .get(authenticate, userCurrentProfile)
  .put(authenticate, updateCurrentProfile);

router.route("/:id")
  .delete(authenticate, authorizeAdmin, deleteUserById)
  .get(authenticate, authorizeAdmin, getUserById)
  .put(authenticate, authorizeAdmin, updateUserById);

export default router;