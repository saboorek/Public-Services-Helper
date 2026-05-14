import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    LabelBuilder
} from "discord.js";

export const denyWarrantButton = {
    customId: "deny",

    async execute(interaction: ButtonInteraction): Promise<void> {
        const channelId = interaction.customId.split("_")[1];

        const modal = new ModalBuilder()
            .setCustomId(`denyWarrantModal_${channelId}`)
            .setTitle("❌ Odrzucenie wniosku");

        const judge = new TextInputBuilder()
            .setCustomId('denyJudge')
            .setPlaceholder('Wprowadź imię i nazwisko sędzi')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(100);

        const judgeLabel = new LabelBuilder()
            .setLabel('Sędzia rozpatrujący nakaz:')
            .setTextInputComponent(judge);

        const reason = new TextInputBuilder()
            .setCustomId(`denyReason`)
            .setPlaceholder('Wprowadź powód odrzucenia wniosku')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1024);

        const reasonLabel = new LabelBuilder()
            .setLabel('Powód odrzucenia wniosku:')
            .setTextInputComponent(reason);

        modal.addLabelComponents(judgeLabel, reasonLabel);

        await interaction.showModal(modal);
    }
};

export default denyWarrantButton;