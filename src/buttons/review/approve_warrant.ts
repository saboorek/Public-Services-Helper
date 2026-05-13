import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    LabelBuilder
} from "discord.js";

export const approveWarrantButton = {
    customId: "approve",

    async execute(interaction: ButtonInteraction): Promise<void> {
        const channelId = interaction.customId.split("_")[1];

        const modal = new ModalBuilder()
            .setCustomId(`approveWarrantModal_${channelId}`)
            .setTitle("✅ Zatwierdzenie wniosku");

        const judge = new TextInputBuilder()
            .setCustomId('approveJudge')
            .setPlaceholder('Wprowadź imię i nazwisko sędzi')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(100);

        const judgeLabel = new LabelBuilder()
            .setLabel('Sędzia rozpatrujący nakaz:')
            .setTextInputComponent(judge);

        const note = new TextInputBuilder()
            .setCustomId("approveNotes")
            .setPlaceholder('Wprowadź dodatkowe informacje')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(1024);

        const noteLabel = new LabelBuilder()
            .setLabel('Dodatkowe informacje:')
            .setTextInputComponent(note);

        modal.addLabelComponents(judgeLabel, noteLabel);


        await interaction.showModal(modal);
    }
};

export default approveWarrantButton;