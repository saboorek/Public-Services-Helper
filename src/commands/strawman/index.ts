import {SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits} from 'discord.js';
import { Command } from "../../types/Command";
import {addStrawmanSubcommand} from "./add";
import {listStrawmanSubcommand} from "./list";
import { removeStrawmanSubcommand } from "./remove";


const StrawmanCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('slup')
        .setDescription('Komenda do zarządzania nieruchomościami i pojazdami zarejestrowanymi na słupa.')
        .addSubcommand(addStrawmanSubcommand.data)
        .addSubcommand(listStrawmanSubcommand.data)
        .addSubcommand(removeStrawmanSubcommand.data),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add':
                await addStrawmanSubcommand.execute(interaction);
                break;
            case 'list':
                await listStrawmanSubcommand.execute(interaction);
                break;
            case 'remove':
                await removeStrawmanSubcommand.execute(interaction);
                break;
        }
    }

}

export default StrawmanCommand;