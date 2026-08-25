import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags} from 'discord.js';
import { Command } from "../../types/Command";
import { panelSubcommand } from "./panel";
import { setChannelSubcommand } from "./setChannel";
import { setCategorySubcommand } from "./setCategory";
import { setRoleSubcommand } from "./setRole";

const ticketsCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('tickets')
        .setDescription('System zgłoszeń.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addSubcommand(panelSubcommand.data)
        .addSubcommand(setChannelSubcommand.data)
        .addSubcommand(setCategorySubcommand.data)
        .addSubcommand(setRoleSubcommand.data),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
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
            case 'setrole':
                await setRoleSubcommand.execute(interaction);
                break;
            // Add other subcommand cases here
        }
    }
}

export default ticketsCommand;