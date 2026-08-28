import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const publicOrgButton = {
    customId: 'btn_ticket_public_org',

    async execute(interaction: ButtonInteraction): Promise<void> {

        const publicOrgModal = new ModalBuilder()
            .setCustomId('publicOrgModal')
            .setTitle('Wniosek do opiekunów strefy publicznej');

        const publicOrgDescription = new TextInputBuilder()
            .setCustomId('publicOrgDescription')
            .setPlaceholder('Opisz sprawę z jaką do nas przychodzisz')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)

        const publicOrgDescriptionLabel = new LabelBuilder()
            .setLabel('Opis sprawy:')
            .setTextInputComponent(publicOrgDescription);

        publicOrgModal.addLabelComponents(publicOrgDescriptionLabel);

        await interaction.showModal(publicOrgModal);
    }
}