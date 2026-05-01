import {SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits} from 'discord.js';
import { Command } from "../../types/Command";

const SlupCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('slup')
        .setDescription('Komenda do zarządzania nieruchomościami i pojazdami zarejestrowanymi na słupa.'),


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
        }
    }

}

export default SlupCommand;