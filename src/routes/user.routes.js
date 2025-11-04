import { Router } from "express";
import { registeruser } from "../controllers/user.controller.js";
import {upload} from "./Middleware/multer.middleware.js";
const router = Router();

// Define user-related routes here
router.route("/register").post(
    upload.feilds([{
    name: 'avatar',
    maxcount : 1 
    },
    {
        name: "coverimage",
        maxcount : 1
    }

]),    registeruser);

export default router;