import { Client } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { logger } from "../utils/logger";

export const loadEvents = async (client: Client) => {
    const eventsPath = path.join(__dirname, "../events");
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    logger.info("🔄 Rozpoczynam ładowanie eventów...");

    for (const file of eventFiles) {
        try {
            const { default: event } = await import(`${eventsPath}/${file}`);

            if (!event?.name || !event?.execute) {
                logger.warn(`⚠️ Pominięto plik ${file} – brak 'name' lub 'execute'`);
                continue;
            }

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
                logger.success(`🟢 Załadowano event (once): ${event.name}`);
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
                logger.info(`🟡 Załadowano event: ${event.name}`);
            }
        } catch (err) {
            logger.error(`❌ Błąd podczas ładowania eventu z pliku ${file}: ${err}`);
        }
    }

    logger.success(`✅ Wszystkie eventy zostały pomyślnie załadowane (${eventFiles.length})`);
};
