import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const rescueTicketButton = {
    customId: 'btn_ticket_rescue',

    async execute(interaction: ButtonInteraction): Promise<void> {

        const rescueTicketModal = new ModalBuilder()
            .setCustomId('rescueTicketModal')
            .setTitle('Wniosek do opiekuna LEA');

        const rescueTicketDescription = new TextInputBuilder()
            .setCustomId('rescueTicketDescription')
            .setPlaceholder('Opisz sprawę z jaką do nas przychodzisz')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)

        const rescueTicketDescriptionLabel = new LabelBuilder()
            .setLabel('Opis sprawy:')
            .setTextInputComponent(rescueTicketDescription);

        rescueTicketModal.addLabelComponents(rescueTicketDescriptionLabel);

        await interaction.showModal(rescueTicketModal);
    }
}