import { ButtonInteraction, MessageFlags } from "discord.js";

export const buttonCloseCancel = {
    customId: 'ticket_close_cancel',

    async execute(interaction: ButtonInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.editReply({ content: '↩️ Anulowano zamknięcie ticketu.', components: [] });
    }
}