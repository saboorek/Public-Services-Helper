import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const leaTicketButton = {
    customId: 'btn_ticket_lea',

    async execute(interaction: ButtonInteraction): Promise<void> {

        const leaTicketModal = new ModalBuilder()
            .setCustomId('leaTicketModal')
            .setTitle('Wniosek do opiekuna LEA');

        const leaTicketDescription = new TextInputBuilder()
            .setCustomId('leaTicketDescription')
            .setPlaceholder('Opisz sprawę z jaką do nas przychodzisz')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)

        const leaTicketDescriptionLabel = new LabelBuilder()
            .setLabel('Opis sprawy:')
            .setTextInputComponent(leaTicketDescription);

        leaTicketModal.addLabelComponents(leaTicketDescriptionLabel);

        await interaction.showModal(leaTicketModal);
    }
}