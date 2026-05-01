import {
    ChatInputCommandInteraction, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder, LabelBuilder, ModalBuilder
} from "discord.js";

export const addStrawmanSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("add")
            .setDescription("Dodaje nowe nieruchomości lub pojazdy zarejestrowane na słupa"),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {

        const strawmanModal = new ModalBuilder()
            .setCustomId('addStrawmanModal')
            .setTitle('Nowa nieruchomość lub pojazd na słupa')

        const strawmanTypeSelect = new StringSelectMenuBuilder()
            .setCustomId('strawmanTypeSelect')
            .setPlaceholder('Wybiesz typ przedmiotu rejestrowanego na słupa')
            .setRequired(true)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Budynek')
                    .setValue('Budynek'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Pojazd')
                    .setValue('Pojazd')
            );
        const strawmanTypeLabel = new LabelBuilder()
            .setLabel('Typ przedmiotu')
            .setDescription('Wybiesz typ przedmiotu rejestrowanego na słupa')
            .setStringSelectMenuComponent(strawmanTypeSelect);

        const strawmanItemId = new TextInputBuilder()
            .setCustomId('strawmanItemId')
            .setPlaceholder('Podaj ID nieruchomości/Pojazdu')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100)

        const strawmanItemIdLabel = new LabelBuilder()
            .setLabel('ID przedmiotu')
            .setDescription('Podaj ID nieruchomości/Pojazdu')
            .setTextInputComponent(strawmanItemId);

        const strawmanForumLink = new TextInputBuilder()
            .setCustomId('strawmanForumLink')
            .setPlaceholder('Podaj link do postu na forum')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const strawmanForumLinkLabel = new LabelBuilder()
            .setLabel('Link do forum')
            .setDescription('Podaj link do postu na forum')
            .setTextInputComponent(strawmanForumLink);

        strawmanModal.addLabelComponents(strawmanTypeLabel, strawmanItemIdLabel, strawmanForumLinkLabel);

        await interaction.showModal(strawmanModal);
    }
}