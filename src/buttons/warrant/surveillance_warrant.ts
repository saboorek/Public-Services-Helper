import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const surveillanceWarrantButton = {
    customId: 'surveillance_warrant',

    async execute(interaction: ButtonInteraction): Promise<void> {
        const surveillanceModal = new ModalBuilder()
            .setCustomId('surveillanceWarrantModal')
            .setTitle('🛰️ Wniosek o nakaz na narzędzia inwigilacji');

        const narrative = new TextInputBuilder()
            .setCustomId('surveillanceWarrantNarrative')
            .setPlaceholder('Wpisz narrację dotyczącą Probable Cause oraz dowody')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const narrativeLabel = new LabelBuilder()
            .setLabel('Narracja dot. Probable Cause oraz dowody:')
            .setTextInputComponent(narrative);

        const applicant = new TextInputBuilder()
            .setCustomId('surveillanceWarrantApplicant')
            .setPlaceholder('Wpisz imię i nazwisko, pozycję oraz agencję')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100)

        const applicantLabel = new LabelBuilder()
            .setLabel('Wnioskujący o nakaz, pozycja oraz agencja:')
            .setTextInputComponent(applicant);

        const place = new TextInputBuilder()
            .setCustomId('surveillanceWarrantPlace')
            .setPlaceholder('Wpisz miejsce/mienie/osoby objęte nakazem')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const placeLabel = new LabelBuilder()
            .setLabel('Miejsce/mienie/osoby objęte nakazem:')
            .setTextInputComponent(place);

        surveillanceModal.addLabelComponents(narrativeLabel, applicantLabel, placeLabel);

        await interaction.showModal(surveillanceModal);
    }

}