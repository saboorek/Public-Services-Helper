import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

export const addSlupSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("add")
            .setDescription("Dodaje nowe nieruchomości lub pojazdy zarejestrowane na słupa"),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {

        const strawName = new TextInputBuilder()
            .setCustomId('sName')
            .setLabel("Nazwa nieruchomości lub pojazdu")
    }
}