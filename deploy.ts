import "dotenv/config";
import { REST, Routes } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from './src/types/Command';

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID) {
    console.error("❌ Błąd konfiguracji: Upewnij się, że TOKEN i CLIENT_ID są ustawione w .env.");
    process.exit(1);
}

const commandsPath = path.join(__dirname, 'src', 'commands');
const commandsData: any[] = [];

async function loadAllCommands() {
    const folders = fs.readdirSync(commandsPath);

    for (const folder of folders) {
        const categoryPath = path.join(commandsPath, folder);

        if (!fs.statSync(categoryPath).isDirectory()) continue;

        const indexFile = path.join(categoryPath, "index.ts");

        if (fs.existsSync(indexFile)) {
            try {
                console.log(`📦 Ładuję komendę: ${folder}`);

                const { default: command } = await import(indexFile);

                if (command && (command as Command).data) {
                    commandsData.push((command as Command).data.toJSON());
                } else {
                    console.warn(`⚠️ Pominięto komendę w ${folder}/index.ts – brak poprawnego eksportu 'default' lub 'data'.`);
                }
            } catch (err) {
                console.error(`❌ Błąd podczas importowania komendy z folderu ${folder}: ${err}`);
            }
        }
    }
}

async function deploy() {
    await loadAllCommands();

    if (commandsData.length === 0) {
        console.log("⚠️ Nie znaleziono żadnych komend do wczytania.");
        return;
    }

    const rest = new REST({ version: '10' }).setToken(TOKEN!);

    try {
        console.log(`📡 Rozpoczynam odświeżanie ${commandsData.length} komend...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID!, GUILD_ID!),
            { body: commandsData },
        ) as any;

        console.log(`✅ Pomyślnie załadowano ${data.length} komend do Discord API na serwerze ${GUILD_ID}.`);

    } catch (error) {
        console.error('❌ BŁĄD PODCZAS REJESTRACJI KOMEND:');
        console.error(error);
    }
}

deploy();