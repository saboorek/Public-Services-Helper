import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const searchWarrantButton = {
    customId: 'search_warrant',

    async execute(interaction: ButtonInteraction): Promise<void> {
        const searchModal = new ModalBuilder()
            .setCustomId('searchWarrantModal')
            .setTitle('🔎 Wniosek o nakaz przeszukania');

        const narrative = new TextInputBuilder()
            .setCustomId('searchWarrantNarrative')
            .setPlaceholder('Wpisz narrację dotyczącą Probable Cause oraz dowody')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const narrativeLabel = new LabelBuilder()
            .setLabel('Narracja dot. Probable Cause oraz dowody:')
            .setTextInputComponent(narrative);

        const applicant = new TextInputBuilder()
            .setCustomId('searchWarrantApplicant')
            .setPlaceholder('Wpisz imię i nazwisko, pozycję oraz agencję')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100)

        const applicantLabel = new LabelBuilder()
            .setLabel('Wnioskujący o nakaz, pozycja oraz agencja:')
            .setTextInputComponent(applicant);

        const place = new TextInputBuilder()
            .setCustomId('searchWarrantPlace')
            .setPlaceholder('Wpisz miejsce/mienie/osoby do przeszukania')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const placeLabel = new LabelBuilder()
            .setLabel('Miejsce/mienie/osoby do przeszukania:')
            .setTextInputComponent(place);

        const items = new TextInputBuilder()
            .setCustomId('searchWarrantItem')
            .setPlaceholder('Podaj informację o przedmiotach, które mają zostać przejęte')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const itemsLabel = new LabelBuilder()
            .setLabel('Przedmioty które mają zostać przejęte:')
            .setTextInputComponent(items);

        searchModal.addLabelComponents(narrativeLabel, applicantLabel, placeLabel, itemsLabel);

        await interaction.showModal(searchModal);
    }

}