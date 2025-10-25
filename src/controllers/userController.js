import User from "../models/user.js";
import {where} from "sequelize";

export const profileUpdate = async (req, res) => {
    try {
        const {id} = req.params
        const {biography,userType} = req.body

        const cvFile = req.files?.cv?.[0];
        const profileFile = req.files?.profilePhoto?.[0];
        const cvFileName = cvFile ? cvFile.filename : null;
        const profilePhotoFileName = profileFile ? profileFile.filename : null;

        const cvPath = cvFileName ? '/uploads/' + cvFileName : undefined;
        const profilePath = profilePhotoFileName ? '/uploads/' + profilePhotoFileName : undefined;

        const updateProfileData = {}
        if (biography !== undefined) {updateProfileData.biography = biography}
        if (userType !== undefined) {updateProfileData.userType = userType}
        if (cvPath !== undefined) {updateProfileData.cvPath = cvPath}
        if (profilePath !== undefined) {updateProfileData.profilePath = profilePath}

        if (!updateProfileData) {
            res.status(500).json({message:'Güncellenecek veri bulunamadı !!'})
        }

        const newUpdateUser = await User.update(
            updateProfileData,
            { where: { id } }
        );

        if (!newUpdateUser) {
            res.status(500).json({message:'Kullanıcı güncellenemedi !!'})
        }

        res.status(200).json({
            message: 'Kullanıcı profili başarıyla güncellendi',
            user: {biography: updateProfileData.biography,userType: updateProfileData.userType,cvPath:updateProfileData.cvPath,profilePath:updateProfileData.profilePath}
    })
    } catch (err) {
       res.status(200).json({message:'Server hatası !!'})
    }


}




//Validation burda kullanılacak (DÜŞÜNÜCEM)