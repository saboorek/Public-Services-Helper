import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const courtRequestButton = {
    customId: 'btn_ticket_court_request',

    async execute(interaction: ButtonInteraction): Promise<void> {

        const courtRequestModal = new ModalBuilder()
            .setCustomId('courtRequestModal')
            .setTitle('Wniosek do sądu');

        const courtRequestDescription = new TextInputBuilder()
            .setCustomId('courtRequestDescription')
            .setPlaceholder('Opisz sprawę z jaką do nas przychodzisz')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)

        const courtRequestDescriptionLabel = new LabelBuilder()
            .setLabel('Opis sprawy:')
            .setTextInputComponent(courtRequestDescription);

        courtRequestModal.addLabelComponents(courtRequestDescriptionLabel);

        await interaction.showModal(courtRequestModal);
    }
}