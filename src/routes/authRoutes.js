import express from 'express';
import {registerUser, loginUser, updateUser, forgotPassword, resetPassword,verifyEmail} from "../controllers/authController.js";
import mainUpload from "../middlewares/upload.js";
import {registerRules,loginRules,validateRulesCheck} from "../middlewares/validators.js";
import { protect, authorize } from '../middlewares/authMiddleware.js';





const router = express.Router();

router.post('/register',mainUpload.fields([{name:'cv',maxCount:1}, {name:'profilePhoto',maxCount:1}]),registerUser,registerRules,validateRulesCheck);
router.get('/admin',protect,authorize('admin',(req,res)=>{res.status(200).json({message:'Tebrikler admin olarak giriş yaptınız.'})}))
router.post('/login',loginUser,loginRules,validateRulesCheck);
router.post('/update',mainUpload.fields([{name:'cv',maxCount:1}, {name:'profilePhoto',maxCount:1}]),updateUser);
router.put('/update/:id',mainUpload.fields([{name:'cv',maxCount:1}, {name:'profilePhoto',maxCount:1}]), updateUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token',verifyEmail);


export default router;