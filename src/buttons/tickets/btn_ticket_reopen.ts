import { ButtonInteraction, MessageFlags, TextChannel, EmbedBuilder } from "discord.js";
import { EmbedColors } from "../../config/colors";
import TicketCase from "../../models/TicketCase";
import TicketsConfig from "../../models/TicketsConfig";

export const ticketReopenButton = {
    customId: 'ticket_reopen',

    async execute(interaction: ButtonInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.channel as TextChannel;
        const ticketCase = await TicketCase.findOne({ channelId: channel.id });

        if (!ticketCase) {
            await interaction.editReply({ content: '❌ Nie znaleziono danych ticketu.' });
            return;
        }

        const config = await TicketsConfig.findOne({ guildId: interaction.guildId });

        ticketCase.deleteAt = null;
        await ticketCase.save();

        const member = await interaction.guild!.members.fetch(ticketCase.creatorId).catch(() => null);
        if (member) {
            await channel.permissionOverwrites.edit(member, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
            });
        }

        if (config?.category.ongoingTickets) {
            await channel.setParent(config.category.ongoingTickets, { lockPermissions: false });
        }

        const newName = channel.name.replace(/^🔒-/, '🟢-');
        await channel.setName(newName);

        await interaction.message.edit({ components: [] });

        await interaction.editReply({ content: '✅ Ticket został ponownie otwarty.' });
        const embed = new EmbedBuilder()
            .setColor(EmbedColors.info)
            .setDescription(`🔓 Ticket został ponownie otwarty przez <@${interaction.user.id}>.`)
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    }
};