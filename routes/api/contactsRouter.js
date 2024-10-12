import express from "express";
import {
  addContact,
  deleteContact,
  getAllContacts,
  getContactById,
  updateContact,
  updateStatusContact,
} from "../../controllers/contactsController.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticateToken, getAllContacts);
router.get("/:contactId", authenticateToken, getContactById);
router.post("/", authenticateToken, addContact);
router.delete("/:contactId", authenticateToken, deleteContact);
router.put("/:contactId", authenticateToken, updateContact);
router.patch("/:contactId/favorite", authenticateToken, updateStatusContact);

export { router };
