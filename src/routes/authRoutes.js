import express from 'express';
import {registerUser, loginUser, updateUser, forgotPassword, resetPassword, verifyPasswordEmail, refreshToken, logoutUser} from "../controllers/authController.js";
import mainUpload from "../middlewares/upload.js";
import {registerRules,loginRules,validateRulesCheck} from "../middlewares/validators.js";
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {profileUpdate} from "../controllers/userController.js";
import {sendVerificationMail, verifyEmail} from '../controllers/sendMailController.js';


const router = express.Router();


router.post('/register',mainUpload.fields([{name:'cv',maxCount:1}, {name:'profilePhoto',maxCount:1}]),registerUser,registerRules,validateRulesCheck);
router.post('/login',loginUser,loginRules,validateRulesCheck);
router.post('/logout',logoutUser); // Veritabanındaki resetTokenı temizliyor
router.post('/update',mainUpload.fields([{name:'cv',maxCount:1}, {name:'profilePhoto',maxCount:1}]),updateUser);
router.put('/update/:id',mainUpload.fields([{name:'cv',maxCount:1}, {name:'profilePhoto',maxCount:1}]), updateUser);
router.post('/profileUpdate/:id',mainUpload.fields([{name:'cv',maxCount:1}, {name:'profilePhoto',maxCount:1}]),profileUpdate);
router.post('/send-verifyMail',protect,sendVerificationMail); // Mail doğrulama
router.get('/admin', protect, authorize('admin'), (req, res) => {res.status(200).json({ message: 'Tebrikler admin olarak giriş yaptınız.' });});
router.post('/forgot-password', forgotPassword); //Şifremi unuttum maili gönderiyor
router.post('/reset-password/:token', resetPassword); //Şifremi unuttum kısmındaki yeni şifreyi veritabanına kaydediyor
router.get('/verifyPassword-email/:token',verifyPasswordEmail); // resetPassword için gerekli olan tokenı çekiyor
router.get('/verify-email/:token',verifyEmail);
router.post('/refresh-token',refreshToken); // Kullanıcının logout yapmadığı sürece doğrulama maili göndermesini sağlar (Tokenın süresi dolmuşsa tekrar token verir)



export default router;