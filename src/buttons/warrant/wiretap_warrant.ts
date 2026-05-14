import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const wiretapWarrantButton = {
    customId: 'wiretap_warrant',

    async execute(interaction: ButtonInteraction): Promise<void> {
        const wiretapModal = new ModalBuilder()
            .setCustomId('wiretapWarrantModal')
            .setTitle('☎️ Wniosek o otrzymanie numeru telefonu');

        const narrative = new TextInputBuilder()
            .setCustomId('wiretapWarrantNarrative')
            .setPlaceholder('Wpisz uzasadnienie wniosku')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const narrativeLabel = new LabelBuilder()
            .setLabel('uzasadnienie wniosku:')
            .setTextInputComponent(narrative);

        const applicant  = new TextInputBuilder()
            .setCustomId('wiretapWarrantApplicant')
            .setPlaceholder('Podaj imię i nazwisko, pozycję oraz agencję')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const applicantLabel = new LabelBuilder()
            .setLabel('Wnioskujący o numer, pozycja oraz agencja:')
            .setTextInputComponent(applicant);

        const suspect = new TextInputBuilder()
            .setCustomId('wiretapWarrantSuspect')
            .setPlaceholder('Podaj imię i nazwisko osoby objętej wnioskiem o numer')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const suspectLabel = new LabelBuilder()
            .setLabel('Osoba objęta wnioskiem o numer:')
            .setTextInputComponent(suspect);

        wiretapModal.addLabelComponents(narrativeLabel, suspectLabel, applicantLabel);

        await interaction.showModal(wiretapModal);
    }

}