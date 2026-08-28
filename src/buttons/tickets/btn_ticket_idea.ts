import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder, UserSelectMenuBuilder
} from "discord.js";

export const ideaButton = {
    customId: 'btn_ticket_idea',

    async execute(interaction: ButtonInteraction): Promise<void> {

        const ideaModal = new ModalBuilder()
            .setCustomId('ideaModal')
            .setTitle('Pomysł');

        const ideaDescription = new TextInputBuilder()
            .setCustomId('ideaDescription')
            .setPlaceholder('Opisz swój pomysł')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)

        const ideaDescriptionLabel = new LabelBuilder()
            .setLabel('Opis pomysłu:')
            .setTextInputComponent(ideaDescription);

        ideaModal.addLabelComponents(ideaDescriptionLabel);

        await interaction.showModal(ideaModal);
    }
}