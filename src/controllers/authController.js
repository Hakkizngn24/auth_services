import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import {Op} from 'sequelize';
import crypto from 'crypto';
import {sendMail} from '../utils/mail.js';
import nodemailer from 'nodemailer';

dotenv.config();


export const registerUser = async (req,res) => {
    try {
        const { username, name, surname, email, password, rePassword, kimlikNo, cv, biography, phoneNumber, profilePhoto, userType } = req.body;

        if (password !== rePassword) {
            return res.status(400).json({message:'Password do not match !!'});
        }

        const checkUser = await User.findOne({
            where: {
                [Op.or]: [{email}, {username}, {phoneNumber}, {kimlikNo}]
            }
        });

        if (checkUser) {
            return res.status(400).json({message:'User with email, username, phone number, or kimlikNo already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const cvFile = req.files?.cv?.[0];
        const profileFile = req.files?.profilePhoto?.[0];

        const cvPath = cvFile ? cvFile.path : null;
        const profilePath = profileFile ? profileFile.path : null;

        const newUser = await User.create({
            username,
            name,
            surname,
            email,
            password: hashedPassword,
            kimlikNo,
            cv :cvPath,
            biography,
            phoneNumber,
            profilePhoto: profilePath ,
            userType
        });


        const token = jwt.sign(
            {id:newUser.id, username:newUser.username, email:newUser.email, userType:newUser.userType},
            process.env.JWT_SECRET,
            {expiresIn:'1h'}
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                name: newUser.name,
                surname: newUser.surname,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber,
                profilePhoto: newUser.profilePhoto,
                userType: newUser.userType
            }
        });


    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({message:'server error !!', error: err.message});
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
                ]
            }
        });

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
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

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



    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({message:'server error !!', error: err.message});
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, email, phoneNumber, cv, biography, profilePhoto, userType } = req.files;


        const findUser = await User.findByPk(id);
        if (!findUser) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı!!' });
        }


        let hashedPassword = findUser.password;
        if (password) {
            const samePassword = await bcrypt.compare(password, findUser.password);
            if (samePassword) {
                return res.status(400).json({ message: 'Yeni şifre eskiyle aynı olamaz!' });
            }
            hashedPassword = await bcrypt.hash(password, 10);
        }

        if (req.files?.cv) {
            updateUser.cv = req.files.profilePhoto[0].path;
        }


        await User.update(
            {
                password: hashedPassword,
                email,
                phoneNumber,
                cv,
                biography,
                profilePhoto,
                userType
            },
            { where: { id } }
        );


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

    } catch (err) {
        console.error('Update Error:', err);
        res.status(500).json({ message: 'Server error!!' });
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
            },
            tls: { rejectUnauthorized: false }
        });

        await user.save();

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

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { [Op.gt]: new Date() }
            }
        })

        if (!user) {return res.status(400).json({message:'Expires geçersiz veya süresi dolmuş.'})}

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save()

        await sendMail({
            to: user.email,
            subject: 'Şifre değişti',
            text: 'Şifreniz başarıyla değiştirildi.Eğer bunu siz yapmadıysanız lütfen destek ile iletişime geçiniz.'
        });

    } catch (err) {
        console.error('Reset password error: '+err)
        res.status(500).json({message:'Server error !!'})
    }
}






















