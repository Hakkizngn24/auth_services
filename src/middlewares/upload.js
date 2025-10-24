import multer, { diskStorage } from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve('uploads');
console.log('1[upload.js] Yüklenecek hedef klasör:', uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(`2[upload.js] destination fonksiyonu başladı. Dosya: ${file.originalname}`);
        try {
            if (!fs.existsSync(uploadDir)) {
                console.log(`3[upload.js] Klasör (${uploadDir}) bulunamadı, oluşturuluyor...`);
                fs.mkdirSync(uploadDir, { recursive: true });
                console.log(`4[upload.js] Klasör oluşturuldu.`);
            } else {
                console.log(`5[upload.js] Klasör (${uploadDir}) zaten var.`);
            }
            console.log(`6[upload.js] destination callback (cb) çağrılıyor...`);
            cb(null, uploadDir)
            console.log(`7[upload.js] destination callback çağrıldı.`);
        } catch (error) {
            console.error('8[upload.js] destination içinde HATA:', error);
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        console.log(`9[upload.js] filename fonksiyonu başladı. Dosya: ${file.originalname}`);
        try {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            const finalFilename = file.fieldname + '-' + uniqueSuffix + ext;
            console.log(`10[upload.js] filename callback (cb) çağrılıyor. Yeni dosya adı: ${finalFilename}`);
            cb(null, finalFilename);
            console.log(`11[upload.js] filename callback çağrıldı.`);
        } catch (error) {
            console.error('12[upload.js] filename içinde HATA:', error);
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