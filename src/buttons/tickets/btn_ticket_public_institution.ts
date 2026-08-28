import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const publicInstitutionButton = {
    customId: 'btn_ticket_public_institution',

    async execute(interaction: ButtonInteraction): Promise<void> {

        const publicInstitutionModal = new ModalBuilder()
            .setCustomId('publicInstitutionModal')
            .setTitle('Wniosek do instytucji publicznej')

        const publicInstitutionDescription = new TextInputBuilder()
            .setCustomId('publicInstitutionDescription')
            .setPlaceholder('Opisz sprawę z jaką do nas przychodzisz')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)

        const publicInstitutionDescriptionLabel = new LabelBuilder()
            .setLabel('Opis sprawy:')
            .setTextInputComponent(publicInstitutionDescription);

        publicInstitutionModal.addLabelComponents(publicInstitutionDescriptionLabel);

        await interaction.showModal(publicInstitutionModal);
    }
}