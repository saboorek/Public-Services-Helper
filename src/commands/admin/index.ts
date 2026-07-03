import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags} from 'discord.js';
import { Command } from "../../types/Command";
import { setChannelSubcommand } from "./setChannel";
import { mapRoleSubcommand } from "./mapRole";
import { setDefaultRoleSubcommand } from "./setDefaultRole";
import { showRoleSubcommand } from "./showRole";
import { zgpLimitSubcommand } from "./zgpLimit";

const adminCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Komenda administracyjna do zarządzania botem.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(setChannelSubcommand.data)
        .addSubcommand(showRoleSubcommand.data)
        .addSubcommand(setDefaultRoleSubcommand.data)
        .addSubcommand(mapRoleSubcommand.data)
        .addSubcommand(zgpLimitSubcommand.data),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
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
            case 'maprole':
                await mapRoleSubcommand.execute(interaction);
                break;
            case 'setdefaultrole':
                await setDefaultRoleSubcommand.execute(interaction);
                break;
            case 'showrole':
                await showRoleSubcommand.execute(interaction);
                break;
            case 'zgplimit':
                await zgpLimitSubcommand.execute(interaction);
                break;
        }
    }
}

export default adminCommand;