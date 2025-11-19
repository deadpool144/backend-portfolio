import express from "express";
import { contactMe } from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/", contactMe);

export default router;
