import { SlashCommandSubcommandBuilder, ChatInputCommandInteraction, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { EmbedColors } from "../../config/colors";

export const closeSubcommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('close')
        .setDescription('Zamknij aktualne zgłoszenie'),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const confirmEmbed = new EmbedBuilder()
            .setColor(EmbedColors.denied)
            .setTitle('🔒 Zamknięcie ticketu')
            .setDescription('Czy jesteś pewny, że chcesz zamknąć ticket?\n\nPo zamknięciu zostanie utworzony transkrypt, a kanał zostanie usunięty po **12 godzinach**.');

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_close_confirm')
                .setLabel('Zamknij')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('ticket_close_cancel')
                .setLabel('Odrzuć')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            embeds: [confirmEmbed],
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }
}