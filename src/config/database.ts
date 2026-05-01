import mongoose from "mongoose";
import { logger } from '../utils/logger';

export const connectDatabase = async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        logger.error("❌ Brak zmiennej MONGODB_URI w pliku .env");
        process.exit(1);
    }
    try {
        await mongoose.connect(uri);
        const dbName = mongoose.connection.db ? mongoose.connection.db.databaseName : 'unknown';
        logger.success(`✅ Połączono z MongoDB - baza: ${dbName}`);
    } catch (error) {
        logger.error(`❌ Błąd połączenia z MongoDB: ${error}`);
        process.exit(1);
    }
};