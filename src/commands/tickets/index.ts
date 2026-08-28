import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags} from 'discord.js';
import { Command } from "../../types/Command";
import { panelSubcommand } from "./panel";
import { setChannelSubcommand } from "./setChannel";
import { setCategorySubcommand } from "./setCategory";
import { setRoleSubcommand } from "./setRole";
import { addSubcommand } from "./add";
import { removeSubcommand } from "./remove";
import { closeSubcommand } from "./close";

const ticketsCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('tickets')
        .setDescription('System zgłoszeń.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addSubcommand(panelSubcommand.data)
        .addSubcommand(setChannelSubcommand.data)
        .addSubcommand(setCategorySubcommand.data)
        .addSubcommand(setRoleSubcommand.data)
        .addSubcommand(addSubcommand.data)
        .addSubcommand(removeSubcommand.data)
        .addSubcommand(closeSubcommand.data),

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
            case 'add':
                await addSubcommand.execute(interaction);
                break;
            case 'remove':
                await removeSubcommand.execute(interaction);
                break;
            case 'close':
                await closeSubcommand.execute(interaction);
                break;
            default:
                await interaction.reply({
                    content: 'Nieznana subkomenda.',
                    flags: MessageFlags.Ephemeral
                });
        }
    }
}

export default ticketsCommand;