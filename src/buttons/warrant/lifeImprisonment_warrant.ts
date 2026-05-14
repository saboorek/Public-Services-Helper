import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const lifeImprisonmentWarrantButton = {
    customId: 'lifeImprisonment_warrant',

    async execute(interaction: ButtonInteraction): Promise<void> {
        const lifeImprisonmentModal = new ModalBuilder()
            .setCustomId('lifeImprisonmentWarrantModal')
            .setTitle('⚰️ Wniosek o wyrok dożywotniego więzienia');

        const narrative = new TextInputBuilder()
            .setCustomId('lifeImprisonmentWarrantNarrative')
            .setPlaceholder('Wpisz uzasadnienie wniosku')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const narrativeLabel = new LabelBuilder()
            .setLabel('uzasadnienie wniosku:')
            .setTextInputComponent(narrative);

        const applicant  = new TextInputBuilder()
            .setCustomId('lifeImprisonmentWarrantApplicant')
            .setPlaceholder('Podaj imię i nazwisko, pozycję oraz agencję')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const applicantLabel = new LabelBuilder()
            .setLabel('Wnioskujący o wyrok, pozycja oraz agencja:')
            .setTextInputComponent(applicant);

        const suspect = new TextInputBuilder()
            .setCustomId('lifeImprisonmentWarrantSuspect')
            .setPlaceholder('Podaj imię i nazwisko osoby wnioskiem objętej wyrokiem')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const suspectLabel = new LabelBuilder()
            .setLabel('Osoba objęta wnioskiem o wyrok:')
            .setTextInputComponent(suspect);

        const file = new TextInputBuilder()
            .setCustomId('lifeImprisonmentWarrantFile')
            .setPlaceholder('Podaj kartotekę kryminalną osoby')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const fileLabel = new LabelBuilder()
            .setLabel('Kartoteka kryminalna osoby:')
            .setTextInputComponent(file);
        lifeImprisonmentModal.addLabelComponents(narrativeLabel, applicantLabel, suspectLabel, fileLabel);

        await interaction.showModal(lifeImprisonmentModal);
    }

}