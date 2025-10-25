import crypto from "crypto";
import nodemailer from "nodemailer";
import User from '../models/User.js';


export const sendVerificationMail = async (req,res) => {
    try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({message:'User id bulunamadı !!'})
            }

            const user = await User.findByPk(userId);
            if (!user) {
                res.status(404).json({message: 'User bulunamadı !!'})
            }
            if (user.isVerified === true) {
                res.status(400).json({message: 'Mail zaten doğrulanmış !!'})
            }
            const verificationToken = crypto.randomBytes(32).toString('hex');

            user.emailVerificationToken = crypto
                    .createHash('sha256')
                    .update(verificationToken)
                    .digest('hex');

            await user.save();

            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

            const message = `
                <p>Merhaba ${user.name || ''},</p>
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
                to: user.email,
                subject: 'Hesabınızı Doğrulayın !!',
                html: message
            });

            res.status(200).json({
                message: 'Mail doğrulama maili başarıyla gönderildi !!'
            })
    } catch (err) {
        console.error('Send verification Email error: ',err);
        res.status(500).json({message: 'Server error !!'});
    }
}

export const verifyEmail = async (req, res) => {
    try {
        // 1. URL'den token'ı al (örn: /verify-email/:token)
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ message: 'Doğrulama token\'ı bulunamadı.' });
        }

        // 2. Gelen token'ı hash'le (veritabanındakiyle karşılaştırmak için)
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // 3. Veritabanında bu hash'e sahip kullanıcıyı bul
        const user = await User.findOne({ where: { emailVerificationToken: hashedToken } });

        // 4. Kullanıcı bulunamazsa hata ver
        if (!user) {
            // Belki token yanlış, belki daha önce kullanılmış (ve silinmiş)
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş doğrulama linki.' });
        }

        // 5. Kullanıcının durumunu güncelle: Doğrulandı ve token'ı temizle
        user.isVerified = true;
        user.emailVerificationToken = null; // Token'ı tekrar kullanılmasın diye sil
        await user.save(); // Değişiklikleri kaydet

        // 6. Başarı mesajı döndür
        res.status(200).json({ message: 'E-posta başarıyla doğrulandı! Artık giriş yapabilirsiniz.' });

    } catch (err) {
        console.error('Email Verification Error:', err);
        res.status(500).json({ message: 'E-posta doğrulanırken bir sunucu hatası oluştu.', error: err.message });
    }
};
// ------------------------

// ... (varsa sendVerificationEmail fonksiyonu burada) ...