import {Sequelize} from 'sequelize';
import env from './env.js';

const sequelize = new Sequelize (
    env.db.name,
    env.db.user,
    env.db.pass,
    {
        port: 3307,
        host:env.db.host,
        dialect:'mysql',
        logging: false
    }
);
try {
    await sequelize.authenticate();
    console.log('✅ Veritabanına başarıyla bağlanıldı');
} catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error);
}

export default sequelize;
