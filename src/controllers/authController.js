import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import {Op} from 'sequelize';
import crypto from 'crypto';
import {sendMail} from '../utils/mail.js';
import nodemailer from 'nodemailer';

dotenv.config();

export const registerUser = async (req, res) => {
    try {
        console.log("--- 1. Register isteği başladı ---");
        // biography, userType userControllerde ayrı yapılandırılacak !!
        //amaç: Register olurken biography ve userType seçimi saçma ve gereksiz oldu.
        const { username, name, surname, email, password, rePassword, kimlikNo, biography, phoneNumber, userType } = req.body;

        if (password !== rePassword) {
            console.log("HATA: Şifreler eşleşmedi.");
            return res.status(400).json({ message: 'Password do not match !!' });
        }
        console.log("--- 2. Şifreler eşleşti ---");

        console.log("--- 3. Kullanıcı aranıyor (await User.findOne)... ---");
        const checkUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }, { phoneNumber }, { kimlikNo }]
            }
        });
        console.log("--- 4. Kullanıcı arandı ---");

        if (checkUser) {
            console.log("HATA: Kullanıcı zaten mevcut.");
            return res.status(400).json({ message: 'User with email, username, phone number, or kimlikNo already exists' });
        }
        console.log("--- 5. Kullanıcı yeni, devam ediliyor ---");

        console.log("--- 6. Şifre hash'leniyor... ---");
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("--- 7. Şifre hash'lendi ---");

        const cvFile = req.files?.cv?.[0];
        const profileFile = req.files?.profilePhoto?.[0];
        const cvFileName = cvFile ? cvFile.filename : null;
        const profilePhotoFileName = profileFile ? profileFile.filename : null;

        const cvPath = cvFileName ? '/uploads/' + cvFileName : undefined;
        const profilePath = profilePhotoFileName ? '/uploads/' + profilePhotoFileName : undefined;

        console.log("--- 8. Dosya yolları alındı ---");

        console.log("--- 9. Yeni kullanıcı oluşturuluyor... ---");
        const newUser = await User.create({
            username, name, surname, email,
            password: hashedPassword,
            kimlikNo, cv: cvPath, biography, phoneNumber,
            profilePhoto: profilePath, userType
        });
        console.log("--- 10. Yeni kullanıcı oluşturuldu ---");

        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, email: newUser.email, userType: newUser.userType },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log("--- 11. Token oluşturuldu ---");

// userController a gidecek-------------------------------------------------------------------------------
// amaç:kullanıcı giriş yaptıktan sonra opsiyonel olarak doğrulama yapacak (ŞÜPHELİ)
        const verificationToken = crypto.randomBytes(32).toString('hex');

        newUser.emailVerificationToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

        await newUser.save();

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        const message = `
            <p>Merhaba ${newUser.name || ''},</p>
            <p>Hesabınızı doğrulamak için lütfen aşağıdaki linke tıklayın:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        `;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            to: newUser.email,
            subject: 'Hesabınızı Doğrulayın !!',
            html: message
        });
//--------------------------------------------------------------------------------------------------------
        console.log("--- 13. Cevap gönderiliyor... ---");
        res.status(201).json({
            message: 'Kayıt başarılı!',
            token,
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
        });
        console.log("--- 14. Cevap başarıyla gönderildi ---");

    } catch (err) {
        console.error('!!! CATCH BLOĞUNA DÜŞTÜ !!!:', err);
        res.status(500).json({ message: 'server error !!', error: err.message });
    }
};

export const loginUser = async (req,res) => {
    try {
        const {emailOrUsername , password} = req.body;

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email:emailOrUsername},
                    { username:emailOrUsername},
                    { password:password}
                ]
            }
        });
        console.log('Kullanıcı bulundu !!')

        if (!user) {
            return res.status(404).json({message:'User not found !!'})
        }

        const validPassword = await bcrypt.compare(password ,user.password);

        if (!validPassword) {
            return res.status(404).json({message:'Invalid password !!'})
        }

        const token = jwt.sign(
            {
                id:user.id,
                username:user.username,
                email:user.email,
                userType:user.userType
            },
            process.env.JWT_SECRET
        );
        console.log('Token oluşturuldu !!')

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                surname: user.surname,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePhoto: user.profilePhoto,
                userType: user.userType
            }
        });

        console.log('Login işlemi başarılı !!')

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({message:'server error !!', error: err.message});
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, email, phoneNumber, biography, userType } = req.body;

        const cvFileObject = req.files?.cv?.[0];
        const profilePhotoObject = req.files?.profilePhoto?.[0];
        const cvFileName = cvFileObject ? cvFileObject.filename : undefined;
        const profilePhotoFileName = profilePhotoObject ? profilePhotoObject.filename : undefined;

        const cvPath = cvFileName ? '/uploads/' + cvFileName : undefined;
        const profilePhotoPath = profilePhotoFileName ? '/uploads/' + profilePhotoFileName : undefined;

        const findUser = await User.findByPk(id);
        if (!findUser) {
            console.log("--- [updateUser] HATA: Kullanıcı bulunamadı ---");
            return res.status(404).json({ message: 'Kullanıcı bulunamadı!!' });
        }

        const updateData = {};
        if (email !== undefined) { updateData.email = email; }
        if (phoneNumber !== undefined) { updateData.phoneNumber = phoneNumber; }
        if (biography !== undefined) { updateData.biography = biography; }
        if (userType !== undefined) { updateData.userType = userType; }
        if (cvPath !== undefined) { updateData.cv = cvPath; }
        if (profilePhotoPath !== undefined) { updateData.profilePhoto = profilePhotoPath; }

        if (password) {
            const samePassword = await bcrypt.compare(password, findUser.password);
            if (samePassword) {
                return res.status(400).json({ message: 'Yeni şifre eskiyle aynı olamaz!' });
            }
            updateData.password = await bcrypt.hash(password, 10);
        } else {
            console.log("--- [updateUser] ADIM 5: Yeni şifre gelmedi ---");
        }
        const [numberOfAffectedRows] = await User.update(
            updateData,
            { where: { id } }
        );

        if (numberOfAffectedRows > 0 || Object.keys(updateData).length === 0) {
            const updatedUser = await User.findByPk(id, {
                attributes: { exclude: ['password'] }
            });

            if (!updatedUser) {
                return res.status(404).json({ message: 'Güncellenen kullanıcı bulunamadı.' });
            }
            res.status(200).json({
                message: 'Kullanıcı başarıyla güncellendi.',
                user: updatedUser
            });

        } else {
            res.status(200).json({
                message: 'Veri gönderildi ancak veritabanında değişiklik olmadı (muhtemelen aynı veri).',
                user: findUser
            });
        }

    } catch (err) {
        console.error('!!! [updateUser] CATCH BLOĞUNA DÜŞTÜ !!!:', err);
        res.status(500).json({ message: 'Server error!!', error: err.message });
    }
};

export const forgotPassword = async (req,res) => {
    try {
        const {email} = req.body;
        if (!email) return res.status(400).json({message:'Email required !!'});

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(200).json({message: 'If that email exists, a reset link has been sent.'})

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        });

        // await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        const html = `
            <p>Merhaba ${user.username || ''},</p>
            <p>Şifreni sıfırlamak için aşağıdaki linke tıkla (1 saat geçerli):</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>Bu isteği sen yapmadıysan bu maili görmezden gel.</p>
        `;

        await transporter.sendMail({
            to:user.email,
            subject:'Password reset',
            html,
            text:`Reset your password: ${resetUrl}`
        });

        return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });

    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({message:'server error !!'})
    }
}

export const resetPassword = async (req,res) => {
    try {
        const {token} = req.params;
        const {password,rePassword} = req.body

        if (!token) {return res.status(400).json({message:'Token yok !!'});}
        if (!password || !rePassword) {return res.status(400).json({message:'Password veya rePassword yok !!'});}
        if (password !== rePassword) {return res.status(400).json({message:'Password ve rePassword eşleşmiyor !!'});}

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({message:'Token geçersiz veya süresi dolmuş.'});
        }

        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(400).json({message:'Token ile ilişkili kullanıcı bulunamadı.'});
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save()


        await transporter.sendMail({
            to: user.email,
            subject: 'Şifre değişti',
            text: 'Şifreniz başarıyla değiştirildi.Eğer bunu siz yapmadıysanız lütfen destek ile iletişime geçiniz.'
        });
        return res.status(200).json({ message: 'Şifreniz başarıyla değiştirildi.' });
    } catch (err) {
        console.error('Reset password error: '+err)
        res.status(500).json({message:'Server error !!'})
    }
}

export const verifyEmail = async (req,res)=> {
    try {
        const {token} = req.params;

        const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
        const user = await User.findOne({
            where: {
                emailVerificationToken: hashedToken
            }
        });

        if (!user) {
            return res.status(400).json({message:'Geçersiz doğrulama linki.'})
        }

        user.isVerified = true;
        user.emailVerificationToken = null;
        await user.save()

        res.status(200).json({message:'E-posta başarıyla doğrulandı.'})

    } catch (err) {
        console.error('Email verification hatası: ', err);
        res.status(500).json({message:'Sunucu hatası !!'})
    }
}
