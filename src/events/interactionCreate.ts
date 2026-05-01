import { Interaction } from "discord.js";
import { client } from "../config/client";
import { DEVELOPERS } from "../config/developers";

export default {
    name: "interactionCreate",
    async execute(interaction: Interaction) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            if (command.devOnly && !DEVELOPERS.includes(interaction.user.id)) {
                return interaction.reply({
                    content: "❌ Ta komenda jest dostępna tylko dla deweloperów.",
                    ephemeral: true,
                });
            }

            const sub = interaction.options.getSubcommand(false);
            if (sub && command.subCommands?.has(sub)) {
                const subCommand = command.subCommands.get(sub)!;
                return subCommand.execute!(interaction, client);
            }

            if (command.execute) {
                return command.execute(interaction, client);
            }

            return interaction.reply({ content: "Nie znaleziono subkomendy.", ephemeral: true });
        }
        if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);

            if (!command || !command.autocomplete) return;

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(`❌ Błąd autocomplete dla komendy ${interaction.commandName}:`, error);
            }
        }
    }
};