import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const arrestWarrantButton = {
    customId: 'arrest_warrant',

    async execute(interaction: ButtonInteraction): Promise<void> {
        const arrestModal = new ModalBuilder()
            .setCustomId('arrestWarrantModal')
            .setTitle('⛓️‍💥  Wniosek o nakaz aresztowania');

        const narrative = new TextInputBuilder()
            .setCustomId('arrestWarrantNarrative')
            .setPlaceholder('Wpisz narrację dotyczącą Probable Cause oraz dowody')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const narrativeLabel = new LabelBuilder()
            .setLabel('Narracja dot. Probable Cause oraz dowody:')
            .setTextInputComponent(narrative);

        const applicant  = new TextInputBuilder()
            .setCustomId('arrestWarrantApplicant')
            .setPlaceholder('Podaj imię i nazwisko, pozycję oraz agencję')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const applicantLabel = new LabelBuilder()
            .setLabel('Wnioskujący o nakaz, pozycja oraz agencja:')
            .setTextInputComponent(applicant);

        const suspect = new TextInputBuilder()
            .setCustomId('arrestWarrantSuspect')
            .setPlaceholder('Podaj imię i nazwisko osoby objętej nakazem')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const suspectLabel = new LabelBuilder()
            .setLabel('Osoba objęta nakazem aresztowania:')
            .setTextInputComponent(suspect);

        arrestModal.addLabelComponents(narrativeLabel, applicantLabel, suspectLabel);

        await interaction.showModal(arrestModal);
    }

}