import { body, validationResult } from 'express-validator';


export const registerRules = (req,res)=>{

    body('name').notEmpty().withMessage('İsim alanı boş bırakılamaz !!')
    body('surname').notEmpty().withMessage('Soyisim alanı boş bırakılamaz !!')
    body('username').notEmpty().withMessage('Kullanıcı adı alanı boş bırakılamaz !!')
    body('email').isEmail().withMessage('Email adı alanı boş bırakılamaz !!')
    body('password').isLength({min:8}).withMessage('Şifre en az 8 karakter olmalı !!')
    body('rePassword').custom((value,{req})=>{
        if (value !==res.body.password){
            throw new Error('Şifreler eşleşmiyor !!');
        }
        return true;
    })
}

export const loginRules = () =>[
    body('emailOrUsername').notEmpty().withMessage('Kullanıcı adı veya Email alanı boş bırakılamaz !!'),
    body('password').notEmpty().withMessage('Şifre alanı boş bırakılamaz !!')
];

export const validateRulesCheck = (req,res,next) =>{
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next()
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
    return res.status(422).json({
        errors: extractedErrors,
    });
}




