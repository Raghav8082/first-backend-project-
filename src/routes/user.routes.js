import { Router } from "express";
import { registeruser } from "../controllers/user.controller.js";
const router = Router();

// Define user-related routes here
router.route("/register").post(registeruser);

export default router;