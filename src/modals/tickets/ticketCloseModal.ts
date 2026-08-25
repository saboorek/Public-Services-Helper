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

            const messages = await channel.messages.fetch({ limit: 20 });
            const msgWithButtons = messages.find(m => m.components.length > 0 && m.author.bot);

            if (msgWithButtons) {
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

                await msgWithButtons.edit({ components: [disabledRow] });
            }

            await interaction.editReply({ content: '✅ Ticket został zamknięty.' });

            setTimeout(async () => {
                await channel.delete().catch(() => {});
            }, 12 * 60 * 60 * 1000);

            logger.success(`Ticket ${channel.name} zamknięty przez ${interaction.user.tag}`);

        } catch (error) {
            logger.error(`Błąd podczas zamykania ticketu: ${error}`);
            await interaction.editReply({ content: '❌ Wystąpił błąd podczas zamykania ticketu.' });
        }
    }
}