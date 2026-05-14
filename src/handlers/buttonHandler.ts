import { Client, Collection, ButtonInteraction } from "discord.js";
import path from "path";
import fs from "fs";
import { logger } from "../utils/logger";

interface Button {
    customId: string;
    execute: (interaction: ButtonInteraction) => Promise<void>;
}

function getButtonFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getButtonFiles(fullPath));
        } else if ((entry.name.endsWith('.ts') || entry.name.endsWith('.js')) && !entry.name.endsWith('.d.ts')) {
            files.push(fullPath);
        }
    }

    return files;
}

export function loadButtons(client: Client): void {
    const buttonsPath = path.join(__dirname, "../buttons");

    if (!fs.existsSync(buttonsPath)) {
        logger.warn("Buttons folder does not exist");
        return;
    }

    const buttons = new Collection<string, Button>();

    logger.info("🔄 Rozpoczynam ładowanie buttonów...");

    const buttonFiles = getButtonFiles(buttonsPath);

    for (const filePath of buttonFiles) {
        const buttonModule = require(filePath);
        const button: Button = buttonModule.default || Object.values(buttonModule).find((exp: any) => exp && "customId" in exp && "execute" in exp) as Button;

        if (button && "customId" in button && "execute" in button) {
            buttons.set(button.customId, button);
            logger.success(`🟢 Załadowano button: ${button.customId}`);
        } else {
            logger.warn(`⚠️ Button w pliku ${filePath} nie posiada wymaganych właściwości`);
        }
    }

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        const baseCustomId = interaction.customId.split(/[_:]/)[0];
        const button = buttons.get(baseCustomId) || buttons.get(interaction.customId);

        if (!button) return;

        try {
            await button.execute(interaction);
        } catch (error) {
            logger.error(`Error executing button ${interaction.customId}: ${error}`);

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "❌ Wystąpił błąd podczas przetwarzania tej akcji.",
                    ephemeral: true
                }).catch(() => {});
            }
        }
    });

    logger.success(`✅ Wszystkie buttony zostały pomyślnie załadowane (${buttonFiles.length})`);
}