import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    LabelBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} from "discord.js";

export const complaintButton = {
    customId: 'btn_ticket_complaint',

    async execute(interaction: ButtonInteraction): Promise<void> {
        const complaintModal = new ModalBuilder()
            .setCustomId('complaintModal')
            .setTitle('Skarga do opiekunów strefy publicznej');

        const complaintTypeSelect = new StringSelectMenuBuilder()
            .setCustomId('complaintTypeSelect')
            .setPlaceholder('Wybierz typ skargi')
            .setRequired(true)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Skarga na frakcję/projekt')
                    .setValue('Skarga na frakcję/projekt'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Skarga na gracza')
                    .setValue('Skarga na gracza')
            );
        const complaintTypeLabel = new LabelBuilder()
            .setLabel('Typ skargi:')
            .setDescription('Wybierz typ skargi')
            .setStringSelectMenuComponent(complaintTypeSelect);

        const complaintSubject = new TextInputBuilder()
            .setCustomId('complaintSubject')
            .setPlaceholder('Wpisz nazwę gracza lub frakcji/projektu, którego dotyczy skarga')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(1024)

        const complaintSubjectLabel = new LabelBuilder()
            .setLabel('Nazwa gracza/frakcji/projektu:')
            .setTextInputComponent(complaintSubject);

        const complaintDescription = new TextInputBuilder()
            .setCustomId('complaintDescription')
            .setPlaceholder('Opisz czego dotyczy skarga. Szczegółowy opis i dowody załącz w oddzielnej wiadomości')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024)

        const complaintDescriptionLabel = new LabelBuilder()
            .setLabel('Opis skargi:')
            .setTextInputComponent(complaintDescription);

        complaintModal.addLabelComponents(complaintTypeLabel, complaintSubjectLabel, complaintDescriptionLabel);

        await interaction.showModal(complaintModal);
    }

}