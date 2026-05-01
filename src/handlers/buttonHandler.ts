import { Client, Collection, ButtonInteraction } from "discord.js";
import path from "path";
import fs from "fs";
import { logger } from "../utils/logger";

interface Button {
    customId: string;
    execute: (interaction: ButtonInteraction) => Promise<void>;
}

export function loadButtons(client: Client): void {
    const buttonsPath = path.join(__dirname, "../buttons");

    if (!fs.existsSync(buttonsPath)) {
        logger.warn("Buttons folder does not exist");
        return;
    }

    const buttons = new Collection<string, Button>();
    const buttonFiles = fs.readdirSync(buttonsPath)
        .filter(file => (file.endsWith(".ts") || file.endsWith(".js")) && !file.endsWith(".d.ts"));

    logger.info("🔄 Rozpoczynam ładowanie buttonów...");

    for (const file of buttonFiles) {
        const filePath = path.join(buttonsPath, file);

        if (!fs.statSync(filePath).isFile()) continue;

        const buttonModule = require(filePath);
        const button: Button = buttonModule.default || Object.values(buttonModule).find((exp: any) => exp && "customId" in exp && "execute" in exp) as Button;

        if (button && "customId" in button && "execute" in button) {
            buttons.set(button.customId, button);
            logger.success(`🟢 Załadowano button: ${button.customId}`);
        } else {
            logger.warn(`⚠️ Button w pliku ${file} nie posiada wymaganych właściwości`);
        }
    }

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        // Obsługa dynamicznych customId (np. "deleteTicket:ticketId")
        const baseCustomId = interaction.customId.split(":")[0];
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