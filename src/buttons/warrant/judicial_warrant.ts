import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const judicialWarrantButton = {
    customId: 'judicial_warrant',

    async execute(interaction: ButtonInteraction): Promise<void> {
        const judicialModal = new ModalBuilder()
            .setCustomId('judicialWarrantModal')
            .setTitle('⚖️ Nakaz sądowy (IRS)');

        const narrative = new TextInputBuilder()
            .setCustomId('judicialWarrantNarrative')
            .setPlaceholder('Wpisz narrację dotyczącą Probable Cause oraz dowody')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const narrativeLabel = new LabelBuilder()
            .setLabel('Narracja dot. Probable Cause oraz dowody:')
            .setTextInputComponent(narrative);

        const applicant = new TextInputBuilder()
            .setCustomId('judicialWarrantApplicant')
            .setPlaceholder('Wpisz imię i nazwisko, pozycję oraz agencję')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100)

        const applicantLabel = new LabelBuilder()
            .setLabel('Wnioskujący o nakaz, pozycja oraz agencja:')
            .setTextInputComponent(applicant);

        const place = new TextInputBuilder()
            .setCustomId('judicialWarrantPlace')
            .setPlaceholder('Wpisz miejsce/mienie/osoby objętej wejściem')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const placeLabel = new LabelBuilder()
            .setLabel('Miejsce/mienie/osoby objęte wejściem:')
            .setTextInputComponent(place);

        const items = new TextInputBuilder()
            .setCustomId('judicialWarrantItem')
            .setPlaceholder('Podaj informację o mieniu, które mają zostać przejęte')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(1024)

        const itemsLabel = new LabelBuilder()
            .setLabel('Mienie które mają zostać przejęte:')
            .setTextInputComponent(items);

        judicialModal.addLabelComponents(narrativeLabel, applicantLabel, placeLabel, itemsLabel);

        await interaction.showModal(judicialModal);
    }

}