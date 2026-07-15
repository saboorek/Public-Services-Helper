import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { Command } from '../../types/Command';
import { addZgpSubcommand } from './add'
import { removeZgpSubcommand } from './remove'
import { listZgpSubcommand } from './list'
import { checkZgpSubcommand } from './check'

const zgpCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('zgp')
        .setDescription('Komenda do zarządzania listą osób ze zgodą na grę w grupach przestępczych')
        .addSubcommand(addZgpSubcommand.data)
        .addSubcommand(removeZgpSubcommand.data)
        .addSubcommand(listZgpSubcommand.data)
        .addSubcommand(checkZgpSubcommand.data),

    async execute (interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
            await interaction.reply({
                content: 'Nie posiadasz odpowiednich uprawnień do użycia tej komendy.',
                flags: MessageFlags.Ephemeral
            })
            return;
        }
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add':
                await addZgpSubcommand.execute(interaction);
                break;
            case 'remove':
                await removeZgpSubcommand.execute(interaction);
                break;
            case 'list':
                await listZgpSubcommand.execute(interaction);
                break;
            case 'check':
                await checkZgpSubcommand.execute(interaction);
                break;
        }
    }
}

export default zgpCommand;