import { ButtonInteraction, MessageFlags, TextChannel } from "discord.js";
import TicketCase from "../../models/TicketCase";

export const ticketDeleteButton = {
    customId: 'ticket_delete',

    async execute(interaction: ButtonInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.channel as TextChannel;

        await TicketCase.deleteOne({ channelId: channel.id });
        await interaction.editReply({ content: '✅ Usuwanie kanału...' });
        await channel.delete().catch(() => {});
    }
};