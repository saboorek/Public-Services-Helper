import { Collection } from "discord.js";
import { readdirSync, statSync } from "fs";
import path from "path";
import { Command } from "../types/Command";
import { logger } from "../utils/logger";

export const loadCommands = async (commandsCollection: Collection<string, Command>) => {
    const commandsPath = path.join(__dirname, "../commands");
    const folders = readdirSync(commandsPath);

    logger.info("🔄 Rozpoczynam ładowanie komend...");

    for (const folder of folders) {
        const categoryPath = path.join(commandsPath, folder);

        if (!statSync(categoryPath).isDirectory()) continue;

        logger.info(`📁 Znaleziono kategorię: ${folder}`);

        const allFilesInFolder = readdirSync(categoryPath);
        const indexFile = allFilesInFolder.find(f => f === "index.ts" || f === "index.js");

        if (!indexFile) {
            logger.warn(`⚠️ Pominięto folder ${folder} – brak pliku index.ts/index.js (głównej komendy)`);
            continue;
        }

        try {
            const indexPath = path.join(categoryPath, indexFile);
            const commandModule = await import(indexPath);
            const command = commandModule.command || commandModule.default;

            if (!command || !command.data || !command.data.name) {
                logger.error(`❌ Błąd: Główna komenda w ${folder}/${indexFile} nie ma poprawnego eksportu 'command' lub 'default'`);
                continue;
            }

            const subCommandFiles = allFilesInFolder.filter(
                f => (f.endsWith(".ts") || f.endsWith(".js")) && !f.startsWith("index.")
            );

            commandsCollection.set(command.data.name, command);

            logger.success(`✅ Załadowano komendę /${command.data.name} (${subCommandFiles.length} plików pomocniczych)`);
        } catch (err) {
            logger.error(`❌ Błąd podczas ładowania komendy z folderu ${folder}: ${err}`);
        }
    }

    logger.success(`✅ Wszystkie komendy zostały pomyślnie załadowane (${commandsCollection.size})`);
};