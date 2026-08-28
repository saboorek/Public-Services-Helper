import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    LabelBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} from "discord.js";

export const irsButton = {
    customId: 'btn_ticket_irs',

    async execute(interaction: ButtonInteraction): Promise<void> {

        const irsModal = new ModalBuilder()
            .setCustomId('irsModal')
            .setTitle('Wniosek o kontrolę majątku');

        const irsTargetNickname = new TextInputBuilder()
            .setCustomId('irsTargetNickname')
            .setPlaceholder('wpisz imię i nazwisko osoby objętej wnioskiem')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100);

        const irsTargetNicknameLabel = new LabelBuilder()
            .setLabel('Osoba objęta wnioskiem:')
            .setTextInputComponent(irsTargetNickname);

        const irsApplicant = new TextInputBuilder()
            .setCustomId('irsApplicant')
            .setPlaceholder('wpisz imię i nazwisko, stopień i agencję wnioskującego')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(1024);

        const irsApplicantLabel = new LabelBuilder()
            .setLabel('Wnioskujący:')
            .setTextInputComponent(irsApplicant);

        const irsDescription = new TextInputBuilder()
            .setCustomId('irsDescription')
            .setPlaceholder('opisz powód wniosku o kontrolę majątku')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000);

        const irsDescriptionLabel = new LabelBuilder()
            .setLabel('Uzasadnienie wniosku:')
            .setTextInputComponent(irsDescription);

        irsModal.addLabelComponents(irsTargetNicknameLabel, irsApplicantLabel, irsDescriptionLabel);

        await interaction.showModal(irsModal);
    }
}