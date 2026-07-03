import {
    ChatInputCommandInteraction, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder, LabelBuilder, ModalBuilder, UserSelectMenuBuilder
} from "discord.js";

export const addZgpSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("add")
            .setDescription("Dodaje nową zgodę na grę w grupie przestępczej"),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {

        const zgpModal = new ModalBuilder()
            .setCustomId("addZgpModal")
            .setTitle('Nowa zgoda na grę w grupie przestępczej')

        const zgpTypeSelect = new StringSelectMenuBuilder()
            .setCustomId("zgpTypeSelect")
            .setPlaceholder("Wybierz typ głównej grupy")
            .setRequired(true)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('LEA')
                    .setValue('LEA'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('RESCUE')
                    .setValue('RESCUE')
            );
        const zgpTypeLabel = new LabelBuilder()
            .setLabel('Typ głównej grupy')
            .setDescription('Wybierz typ głównej grupy użytkownika')
            .setStringSelectMenuComponent(zgpTypeSelect);

        const zgpUserSelect = new UserSelectMenuBuilder()
            .setCustomId("zgpUserSelect")
            .setPlaceholder('Wybierz użytkownika, którego dotyczy zgoda')
            .setRequired(true)

        const zgpUserLabel = new LabelBuilder()
            .setLabel('Użytkownik otrzymujący zgodę')
            .setDescription('Wybierz użytkownika, którego dotyczy zgoda')
            .setUserSelectMenuComponent(zgpUserSelect);

        const zgpUserLink = new TextInputBuilder()
            .setCustomId("zgpUserLink")
            .setPlaceholder('Wklej link do profilu')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const zgpUserLinkLabel = new LabelBuilder()
            .setLabel('Link do profilu użytkownika')
            .setDescription('Wklej link do profilu użytkownika, którego dotyczy zgoda')
            .setTextInputComponent(zgpUserLink);

        const zgpMainGroup = new TextInputBuilder()
            .setCustomId("zgpMainGroup")
            .setPlaceholder('Wpisz nazwę głównej grupy')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const zgpMainGroupLabel = new LabelBuilder()
            .setLabel('Główna grupa użytkownika')
            .setDescription('Wpisz nazwę głównej grupy użytkownika')
            .setTextInputComponent(zgpMainGroup);

        const zgpCrimeGroupLink = new TextInputBuilder()
            .setCustomId("zgpCrimeGroupLink")
            .setPlaceholder('Wklej link do grupy przestępczej')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const zgpCrimeGroupLinkLabel = new LabelBuilder()
            .setLabel('Link do grupy przestępczej')
            .setDescription('Wklej link do grupy przestępczej, w której użytkownik będzie grał')
            .setTextInputComponent(zgpCrimeGroupLink);

        zgpModal.addLabelComponents(zgpTypeLabel, zgpUserLabel, zgpUserLinkLabel, zgpMainGroupLabel, zgpCrimeGroupLinkLabel);

        await interaction.showModal(zgpModal);
    }
}