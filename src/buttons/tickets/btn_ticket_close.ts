import { ButtonInteraction, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import TicketsConfig from "../../models/TicketsConfig";
import { EmbedColors } from "../../config/colors";

export const buttonClose = {
    customId: 'ticket_close',

    async execute(interaction: ButtonInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            /*const config = await TicketsConfig.findOne({ guildId: interaction.guildId });

            const rolesIds = [
                config?.supportRoles.publicOrgManager,
                config?.supportRoles.publicOrgAssistant,
            ].filter(Boolean);

            const memberRoles = (interaction.member as any)?.roles?.cache;
            const hasRole = rolesIds.some(roleId => memberRoles?.has(roleId));

            if (!hasRole) {
                await interaction.editReply({ content: '❌ Nie masz uprawnień do zamknięcia tego ticketu.' });
                return;
            }
*/
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

            await interaction.editReply({
                embeds: [confirmEmbed],
                components: [row]
            });
        } catch (error) {
            console.error('Error handling ticket_close button:', error);
        }
    }
}