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
        type: DataTypes.VIRTUAL,
        allowNull: true
    },
    kimlikNo: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    cv: {
        type: DataTypes.STRING,
        allowNull: true
    },
    biography: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    profilePhoto: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user'
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {

    tableName: 'users',
    timestamps: true
});

export default User;