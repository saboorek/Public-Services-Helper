import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const reportTicketButton = {
    customId: 'btn_ticket_report',

    async execute(interaction: ButtonInteraction): Promise<void> {

        const reportTicketModal = new ModalBuilder()
            .setCustomId('reportTicketModal')
            .setTitle('Zgłoszenie problemu');

        const reportTicketDescription = new TextInputBuilder()
            .setCustomId('reportTicketDescription')
            .setPlaceholder('Opisz sprawę z jaką do nas przychodzisz')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)

        const reportTicketDescriptionLabel = new LabelBuilder()
            .setLabel('Opis sprawy:')
            .setTextInputComponent(reportTicketDescription);

        reportTicketModal.addLabelComponents(reportTicketDescriptionLabel);

        await interaction.showModal(reportTicketModal);
    }
}