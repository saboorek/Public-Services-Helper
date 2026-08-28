import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder, UserSelectMenuBuilder
} from "discord.js";

export const dirtyCopButton = {
    customId: 'btn_ticket_dirty_cop',

    async execute(interaction: ButtonInteraction): Promise<void> {

            const dirtyCopModal = new ModalBuilder()
                .setCustomId('dirtyCopModal')
                .setTitle('Zgłoszenie Dirty Cop');

            const dirtyCopUserSelect = new UserSelectMenuBuilder()
                .setCustomId('dirtyCopUserSelect')
                .setPlaceholder('Wybierz osobę, dla której tworzysz kanał Dirty Cop')
                .setRequired(true)

            const dirtyCopUserSelectLabel = new LabelBuilder()
                .setLabel('Osoba Dirty Cop:')
                .setUserSelectMenuComponent(dirtyCopUserSelect);

            const dirtyCopAgency = new TextInputBuilder()
                .setCustomId('dirtyCopAgency')
                .setPlaceholder('Wpisz nazwę agencji, w której pracuje osoba, dla której tworzysz kanał Dirty Cop')
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
                .setMaxLength(100)

            const dirtyCopAgencyLabel = new LabelBuilder()
                .setLabel('Agencja osoby Dirty Cop:')
                .setTextInputComponent(dirtyCopAgency);

            const dirtyCopName = new TextInputBuilder()
                .setCustomId('dirtyCopName')
                .setPlaceholder('Wpisz inicjały osoby, dla której tworzysz kanał Dirty Cop')
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
                .setMaxLength(100)

            const dirtyCopNameLabel = new LabelBuilder()
                .setLabel('Inicjały osoby Dirty Cop:')
                .setTextInputComponent(dirtyCopName);

            dirtyCopModal.addLabelComponents(dirtyCopUserSelectLabel, dirtyCopAgencyLabel, dirtyCopNameLabel);

            await interaction.showModal(dirtyCopModal);
    }
}