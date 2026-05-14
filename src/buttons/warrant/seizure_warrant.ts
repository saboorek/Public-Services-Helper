import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const seizureWarrantButton = {
    customId: 'seizure_warrant',

    async execute(interaction: ButtonInteraction): Promise<void> {
        const seizureModal = new ModalBuilder()
            .setCustomId('seizureWarrantModal')
            .setTitle('🚗 Wniosek o nakaz zajęcia pojazdu');

        const narrative = new TextInputBuilder()
            .setCustomId('seizureWarrantNarrative')
            .setPlaceholder('Wpisz narrację dotyczącą Probable Cause oraz dowody')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const narrativeLabel = new LabelBuilder()
            .setLabel('Narracja dot. Probable Cause oraz dowody:')
            .setTextInputComponent(narrative);

        const applicant = new TextInputBuilder()
            .setCustomId('seizureWarrantApplicant')
            .setPlaceholder('Wpisz imię i nazwisko, pozycję oraz agencję')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100)

        const applicantLabel = new LabelBuilder()
            .setLabel('Wnioskujący o nakaz, pozycja oraz agencja:')
            .setTextInputComponent(applicant);

        const vehicle = new TextInputBuilder()
            .setCustomId('seizureWarrantVehicle')
            .setPlaceholder('Wpisz pojazd objęty nakazem oraz właściciela')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(1024)

        const vehicleLabel = new LabelBuilder()
            .setLabel('Pojazd objęty nakazem i właściciel:')
            .setTextInputComponent(vehicle);

        const uid = new TextInputBuilder()
            .setCustomId('seizureWarrantUid')
            .setPlaceholder('Wpisz UID pojazdu objętego nakazem')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100)

        const uidLabel = new LabelBuilder()
            .setLabel('UID pojazdu objętego nakazem:')
            .setTextInputComponent(uid);

        const plate = new TextInputBuilder()
            .setCustomId('seizureWarrantPlate')
            .setPlaceholder('Wpisz numer rejestracyjny pojazdu objętego nakazem')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100)

        const plateLabel = new LabelBuilder()
            .setLabel('Numer rejestracyjny pojazdu objętego nakazem:')
            .setTextInputComponent(plate);

        seizureModal.addLabelComponents(narrativeLabel, applicantLabel, vehicleLabel, uidLabel, plateLabel);

        await interaction.showModal(seizureModal);
    }

}