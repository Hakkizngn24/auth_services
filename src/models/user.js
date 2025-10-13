import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rePassword: {
        type: DataTypes.VIRTUAL, // DB’ye kaydetmeyecek, sadece doğrulama için
        allowNull: true
    },
    kimlikNo: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    cv: {
        type: DataTypes.STRING, // dosya yolu veya URL
        allowNull: true
    },
    biography: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    profilePhoto: {
        type: DataTypes.STRING, // dosya yolu veya URL
        allowNull: true
    },
    userType: {
        type: DataTypes.ENUM('student', 'teacher', 'admin'),
        allowNull: false,
        defaultValue: 'student'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: true,
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

export default User;
