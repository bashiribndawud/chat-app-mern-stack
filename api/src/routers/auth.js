import express from 'express'
const router = express.Router();
import { register, Profile, Login } from "../controllers/auth.js";
router.post('/register', register)
router.get('/profile', Profile)
router.post('/login', Login)


export default router;