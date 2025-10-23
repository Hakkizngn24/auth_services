// middleware/formidableUpload.js
import { IncomingForm } from 'formidable';
import path from 'path';
import os from 'os';
import fs from 'fs';

const uploadDir = path.join(os.tmpdir(), 'auth-service-uploads-formidable');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const form = new IncomingForm({
    uploadDir: uploadDir,
    keepExtensions: true, // Dosya uzantılarını koru
    // maxFileSize: 200 * 1024 * 1024, // Gerekirse limit ekle
    // multiples: true, // Birden fazla dosya için
    filename: (name, ext, part, form) => {
        // Basit bir dosya adı oluşturma
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return part.name + '-' + uniqueSuffix + ext;
    }
});

export default function formidableUpload(req, res, next) {
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Formidable Hata:', err);
            return next(err);
        }
        // Formidable, alanları ve dosyaları farklı formatta verir
        // Alanları (fields) req.body'ye benzetelim (dizi olarak gelebilir)
        req.body = {};
        for (const key in fields) {
            req.body[key] = fields[key][0]; // formidable alanları dizi içinde döner
        }
        // Dosyaları req.files'a benzetelim
        req.files = {};
        for (const key in files) {
            // formidable dosya bilgilerini biraz farklı verir, path için 'filepath' kullanılır
            req.files[key] = files[key].map(f => ({
                fieldname: key,
                originalname: f.originalFilename,
                mimetype: f.mimetype,
                path: f.filepath, // path yerine filepath
                size: f.size
            }));
        }
        next();
    });
}