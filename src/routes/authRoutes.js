import express from 'express';
import {registerUser, loginUser, updateUser, forgotPassword, resetPassword} from "../controllers/authController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post('/register',upload.fields([{name:'cv',maxCount:1}, {name:'profilePhoto',maxCount:1}]),registerUser);
router.post('/login',loginUser);
router.post('/update',updateUser);
router.put('/update/:id', upload.fields([{ name: 'cv', maxCount: 1 }, { name: 'profilePhoto', maxCount: 1 }]), updateUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);


export default router;