import multer, {diskStorage} from 'multer';
import path from 'path';
import fs from 'fs';


const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
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

const upload = multer({ storage, fileFilter });
export default upload;