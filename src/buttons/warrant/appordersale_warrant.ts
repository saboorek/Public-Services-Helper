import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const appordersaleWarrantButton = {
    customId: 'appordersale_warrant',

    async execute(interaction: ButtonInteraction): Promise<void> {
        const appOrderSaleModal = new ModalBuilder()
            .setCustomId('appOrderSaleWarrantModal')
            .setTitle('🪙 Wniosek o wydanie nakazu sprzedaży (IRS)');

        const desc = new TextInputBuilder()
            .setCustomId('appOrderSaleWarrantDesc')
            .setPlaceholder('Podaj opis nieruchomości (adres, szacowaną wartość)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const descLabel = new LabelBuilder()
            .setLabel('Opis nieruchomości:')
            .setTextInputComponent(desc);

        const applicant = new TextInputBuilder()
            .setCustomId('appOrderSaleWarrantApplicant')
            .setPlaceholder('Wpisz imię i nazwisko osoby wnioskującej o zatwierdzenie sprzedaży')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100)

        const applicantLabel = new LabelBuilder()
            .setLabel('Wnioskujący o zatwierdzenie sprzedaży:')
            .setTextInputComponent(applicant);

        const date = new TextInputBuilder()
            .setCustomId('appOrderSaleWarrantDate')
            .setPlaceholder('Wpisz datę przejęcia nieruchomości')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const dateLabel = new LabelBuilder()
            .setLabel('Data przejęcia nieruchomości:')
            .setTextInputComponent(date);

        const value = new TextInputBuilder()
            .setCustomId('appOrderSaleWarrantValue')
            .setPlaceholder('Podaj wartość długu podatkowego')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const valueLabel = new LabelBuilder()
            .setLabel('Wartość długu podatkowego:')
            .setTextInputComponent(value);

        const confirmation = new TextInputBuilder()
            .setCustomId('appOrderSaleWarrantConfirmation')
            .setPlaceholder('wklej link prowadzący do screenshota wiadomości wysłanej na forum')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const confirmationLabel = new LabelBuilder()
            .setLabel('Potwierdzenie zajęcia nieruchomości (IRS):')
            .setTextInputComponent(confirmation);

        appOrderSaleModal.addLabelComponents(descLabel, applicantLabel, dateLabel, valueLabel, confirmationLabel);

        await interaction.showModal(appOrderSaleModal);
    }

}