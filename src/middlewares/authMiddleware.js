import User from '../models/user.js';
import jwt from "jsonwebtoken";

export const protect = async (req,res,next)=>{
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token,process.env.JWT_SECRET);

            req.user = await User.findByPk(decoded.id,{
                attributes: {exclude:['password']}
            })
            next()
        } catch (err) {
            console.error(err);
            return res.status(401).json({message:'Yetkisiz erişim, token geçersiz !!'})
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Yetkisiz erişim, token bulunamadı.' });
    }
};

export const authorize = (...roles) => {
    return (req,res,next) =>{
        if (!req.user || !roles.includes(req.user.userType)) {
            return res.status(403)({
                message: `Bu işlemi yapmak için yetkiniz yok. Gerekli rol : ${roles.join(' veya ')}`
            })
        }
        next();
    }
}