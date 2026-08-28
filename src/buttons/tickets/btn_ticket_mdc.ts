import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder
} from "discord.js";

export const mdcButton = {
    customId: 'btn_ticket_mdc',

    async execute(interaction: ButtonInteraction): Promise<void> {

        const mdcModal = new ModalBuilder()
            .setCustomId('mdcModal')
            .setTitle('Zgłoszenie z problemem w MDC');

        const mdcDescription = new TextInputBuilder()
            .setCustomId('mdcDescription')
            .setPlaceholder('Opisz sprawę z jaką do nas przychodzisz')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(4000)

        const mdcDescriptionLabel = new LabelBuilder()
            .setLabel('Opis sprawy:')
            .setTextInputComponent(mdcDescription);

        mdcModal.addLabelComponents(mdcDescriptionLabel);

        await interaction.showModal(mdcModal);
    }
}