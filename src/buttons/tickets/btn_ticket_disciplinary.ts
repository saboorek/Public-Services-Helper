import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder, UserSelectMenuBuilder
} from "discord.js";

export const disciplinaryButton = {
    customId: 'btn_ticket_disciplinary',

    async execute(interaction: ButtonInteraction): Promise<void> {

            const disciplinaryModal = new ModalBuilder()
                .setCustomId('disciplinaryModal')
                .setTitle('Wyjaśnienia');

            const disciplinaryDescription = new TextInputBuilder()
                .setCustomId('disciplinaryDescription')
                .setPlaceholder('Opisz czego dotyczy sprawa')
                .setRequired(true)
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(4000)

            const disciplinaryDescriptionLabel = new LabelBuilder()
                .setLabel('Opis sprawy:')
                .setTextInputComponent(disciplinaryDescription);

            disciplinaryModal.addLabelComponents(disciplinaryDescriptionLabel);

            await interaction.showModal(disciplinaryModal);
    }
}