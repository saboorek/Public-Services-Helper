import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { Command } from '../../types/Command';
import { setChannelSubcommand } from './setChannel';
import { showChannelSubcommand } from './showChannel';
import { panelSubcommand } from "./panel";
import { setCategorySubcommand } from './setCategory';
import { setRoleSubcommand } from "./setRole";
import { showRoleSubcommand } from "./showRole";

const warrantCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('warrant')
        .setDescription('Komenda do zarządzania nakazami.')
        .addSubcommand(panelSubcommand.data)
        .addSubcommand(setChannelSubcommand.data)
        .addSubcommand(setCategorySubcommand.data)
        .addSubcommand(showChannelSubcommand.data)
        .addSubcommand(setRoleSubcommand.data)
        .addSubcommand(showRoleSubcommand.data),

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
            case 'panel':
                await panelSubcommand.execute(interaction);
                break;
            case 'setchannel':
                await setChannelSubcommand.execute(interaction);
                break;
            case 'setcategory':
                await setCategorySubcommand.execute(interaction);
                break;
            case 'showchannel':
                await showChannelSubcommand.execute(interaction);
                break;
            case 'setrole':
                await setRoleSubcommand.execute(interaction);
                break;
            case 'showrole':
                await showRoleSubcommand.execute(interaction);
                break;

        }
    }
}
export default warrantCommand;