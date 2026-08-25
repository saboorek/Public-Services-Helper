import {
    ButtonInteraction,
    MessageFlags,
    TextChannel,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder
} from "discord.js";
import { toChannelSafeName } from "../../utils/channelName";
import { EmbedColors } from "../../config/colors";
import TicketsConfig from "../../models/TicketsConfig";

export const takeButton = {
    customId: 'ticket_take',

    async execute(interaction: ButtonInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const config = await TicketsConfig.findOne({ guildId: interaction.guildId });

            if (!config) {
                await interaction.editReply({ content: '❌ Brak konfiguracji ticketów.' });
                return;
            }

            const rolesIds = [
                config.supportRoles.publicOrgManager,
                config.supportRoles.publicOrgAssistant,
            ].filter(Boolean);

            const memberRoles = (interaction.member as any)?.roles?.cache;
            const hasRole = rolesIds.some(roleId => memberRoles?.has(roleId));

            if (!hasRole) {
                await interaction.editReply({ content: '❌ Nie masz uprawnień do przejęcia tego ticketu.' });
                return;
            }

            const channel = interaction.channel as TextChannel;
            const currentName = channel.name;
            const parts = currentName.split('-');
            const typePart = parts.slice(1).join('-');

            const userNick = (interaction.member as any)?.nickname
                ?? interaction.user.globalName
                ?? interaction.user.username;

            const safeName = toChannelSafeName(userNick);
            await channel.setName(`🟢-${safeName}-${typePart}`);

            const originalMessage = interaction.message;
            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_take')
                    .setLabel('Przejmij')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Zamknij')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(false)
            );

            await originalMessage.edit({ components: [disabledRow] });

            await interaction.editReply({ content: '✅ Przejąłeś ticket.' });


            const embed = new EmbedBuilder()
                .setTitle(`Ticket został przejęty`)
                .setDescription(`Ticket został przejęty przez <@${interaction.user.id}>.`)
                .setColor(EmbedColors.approved)
                .setTimestamp();

            await interaction.followUp({
                embeds: [embed]
            });
        } catch (error) {
            console.error('Error handling ticket_take button:', error);
        }
    }
}