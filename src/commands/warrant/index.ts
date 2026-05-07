import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { Command } from '../../types/Command';
import { setChannelSubcommand } from './setChannel';
import { showChannelSubcommand } from './showChannel';

const warrantCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('warrant')
        .setDescription('Komenda do zarządzania nakazami.')
        .addSubcommand(setChannelSubcommand.data)
        .addSubcommand(showChannelSubcommand.data),

    async execute (interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({
                content: 'Nie posiadasz odpowiednich uprawnień do użycia tej komendy.',
                flags: MessageFlags.Ephemeral
            })
            return;
        }
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'setchannel':
                await setChannelSubcommand.execute(interaction);
                break;
            case 'showchannel':
                await showChannelSubcommand.execute(interaction);
                break;

        }
    }
}
export default warrantCommand;