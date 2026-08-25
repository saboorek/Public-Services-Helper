import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const buttonCloseConfirm = {
    customId: 'ticket_close_confirm',

    async execute(interaction: ButtonInteraction): Promise<void> {
        const modal = new ModalBuilder()
            .setCustomId('ticketCloseModal')
            .setTitle('🔒 Zamknięcie ticketu');

        const reason = new TextInputBuilder()
            .setCustomId('closeReason')
            .setPlaceholder('Wpisz powód zamknięcia ticketu...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(500);

        const reasonLabel = new LabelBuilder()
            .setLabel('Powód zamknięcia:')
            .setTextInputComponent(reason);

        modal.addLabelComponents(reasonLabel);

        await interaction.showModal(modal);
    }
}