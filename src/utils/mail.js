import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.DB_HOST,
    port: Number(process.env.PORT || 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const sendMail = async ({to,subject,html,text}) =>{
    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html
    });
    console.log('Mail sent:' +' '+ info.messageId);
    return info;
};

