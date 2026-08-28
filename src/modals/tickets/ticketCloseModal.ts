import {
    ModalSubmitInteraction,
    MessageFlags,
    TextChannel,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";
import { createTranscript } from "discord-html-transcripts";
import TicketsConfig from "../../models/TicketsConfig";
import { EmbedColors } from "../../config/colors";
import { logger } from "../../utils/logger";
import TicketCase from "../../models/TicketCase";

export const ticketCloseModal = {
    customId: 'ticketCloseModal',

    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const reason = interaction.fields.getTextInputValue('closeReason');
            const channel = interaction.channel as TextChannel;
            const config = await TicketsConfig.findOne({ guildId: interaction.guildId });

            const currentName = channel.name;
            const parts = currentName.split('-');
            const withoutEmoji = parts.slice(1).join('-');
            const newChannelName = `🔒-${withoutEmoji}`;
            await channel.setName(newChannelName);

            if (config?.category.closedTickets) {
                await channel.setParent(config.category.closedTickets, { lockPermissions: false });
            }

            await channel.permissionOverwrites.set([
                { id: interaction.guild!.id, deny: ['ViewChannel', 'SendMessages'] }
            ]);

            const transcript = await createTranscript(channel, {
                filename: `📄-transcript-${channel.id}.html`,
                poweredBy: false,
            });

            const closeEmbed = new EmbedBuilder()
                .setColor(EmbedColors.denied)
                .setTitle('🔒 Ticket zamknięty')
                .setDescription(`Ticket został zamknięty przez <@${interaction.user.id}>.`)
                .addFields({ name: '📝 Powód zamknięcia', value: reason })
                .setFooter({ text: 'Kanał zostanie usunięty za 12 godzin.' })
                .setTimestamp();

            await channel.send({
                embeds: [closeEmbed],
                files: [transcript]
            });

            const transcriptChannelId = config?.transcriptsChannel;
            if (transcriptChannelId) {
                const transcriptChannel = await interaction.guild!.channels
                    .fetch(transcriptChannelId)
                    .catch(() => null) as TextChannel | null;

                if (transcriptChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(EmbedColors.denied)
                        .setTitle(`📄 Transkrypt — ${newChannelName}`)
                        .setDescription(`Zamknięty przez <@${interaction.user.id}>`)
                        .addFields({ name: '📝 Powód zamknięcia', value: reason })
                        .setTimestamp();

                    await transcriptChannel.send({
                        embeds: [logEmbed],
                        files: [transcript]
                    });
                }
            }

            // Wyłącz przyciski na oryginalnej wiadomości kontrolnej
            const ticketCase = await TicketCase.findOne({ channelId: channel.id });
            if (ticketCase?.controlMessageId) {
                const controlMsg = await channel.messages.fetch(ticketCase.controlMessageId).catch(() => null);
                if (controlMsg) {
                    const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId('ticket_take')
                            .setLabel('Przejmij')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('ticket_close')
                            .setLabel('Zamknij')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    );
                    await controlMsg.edit({ components: [disabledRow] });
                }
            }

            await interaction.editReply({ content: '✅ Ticket został zamknięty.' });

            const deleteAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
            await TicketCase.findOneAndUpdate(
                { channelId: channel.id },
                { deleteAt },
                { upsert: true }
            );

            logger.success(`Ticket ${channel.name} zamknięty przez ${interaction.user.tag}`);

            const actionEmbed = new EmbedBuilder()
                .setColor(EmbedColors.denied)
                .setTitle('⚠️ Ticket oczekuje na usunięcie')
                .setDescription('Ticket zostanie automatycznie usunięty za **12 godzin**.\nMożesz go wcześniej usunąć lub ponownie otworzyć.')
                .setTimestamp();

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_reopen')
                    .setLabel('🔓 Otwórz zgłoszenie')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('ticket_delete')
                    .setLabel('🗑️ Usuń')
                    .setStyle(ButtonStyle.Danger)
            );

            await channel.send({ embeds: [actionEmbed], components: [actionRow] });

        } catch (error) {
            logger.error(`Błąd podczas zamykania ticketu: ${error}`);
            await interaction.editReply({ content: '❌ Wystąpił błąd podczas zamykania ticketu.' });
        }
    }
}