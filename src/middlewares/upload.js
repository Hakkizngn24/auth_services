import multer, { diskStorage } from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve('uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            } else {
                console.log(`Klasör (${uploadDir}) zaten var.`);
            }
            cb(null, uploadDir)
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        try {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            const finalFilename = file.fieldname + '-' + uniqueSuffix + ext;
            cb(null, finalFilename);
        } catch (error) {
            cb(error);
        }
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
        return cb(new Error('Geçersiz dosya türü!'), false);
    }
    cb(null, true);
};

const mainUpload = multer({ storage, fileFilter });
export default mainUpload;