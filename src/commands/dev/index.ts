import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { Command } from "../../types/Command";
import { DEVELOPERS } from "../../config/developers";
import { syncRolesSubcommand } from "./syncRoles";
import { evalSubcommand } from "./eval";

const DevCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('Komenda developerska.')
        .setDefaultMemberPermissions(0)
        .addSubcommand(syncRolesSubcommand.data)
        .addSubcommand(evalSubcommand.data),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!DEVELOPERS.includes(interaction.user.id)) {
            await interaction.reply({
                content: '❌ Nie masz uprawnień do użycia tej komendy.',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'syncroles':
                await syncRolesSubcommand.execute(interaction);
                break;
            case 'eval':
                await evalSubcommand.execute(interaction);
                break;
        }
    }
};

export default DevCommand;