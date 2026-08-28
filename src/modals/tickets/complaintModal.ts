import {
    ModalSubmitInteraction,
    EmbedBuilder,
    MessageFlags,
    PermissionFlagsBits,
    ChannelType,
    ActionRowBuilder,
    TextChannel, ButtonBuilder, ButtonStyle
} from "discord.js";
import { logger } from "../../utils/logger";
import { EmbedColors } from "../../config/colors";
import { toChannelSafeName} from "../../utils/channelName";
import { createTicketButtons } from "../../utils/ticketButtons";
import TicketsConfig from "../../models/TicketsConfig";
import TicketCase from "../../models/TicketCase";

export const complaintModal = {
    customId: 'complaintModal',

    async execute (interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {

            const complaintType = interaction.fields.getStringSelectValues('complaintTypeSelect')[0];
            const complaintSubject = interaction.fields.getTextInputValue('complaintSubject');
            const complaintDescription = interaction.fields.getTextInputValue('complaintDescription');

            const config = await TicketsConfig.findOne({ guildId: interaction.guildId });

            if (!config?.category.newTickets) {
                await interaction.editReply({
                    content: '❌ Kategoria ticketów nie została skonfigurowana. Użyj komendy `/tickets setcategory` aby ją ustawić.'
                });
                return;
            }

            const userNick = (interaction.member as any)?.nickname
            ?? interaction.user.globalName
            ?? interaction.user.username;

            const channelName = toChannelSafeName(userNick);

            const permissionOverwrites: any [] = [
                {
                    id: interaction.guild!.id,
                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ],
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ],
                },
            ];

            const rolesIds = [
                config.supportRoles.publicOrgManager,
                config.supportRoles.publicOrgAssistant,
            ];

            for (const roleId of rolesIds) {
                if (roleId) {
                    permissionOverwrites.push({
                        id: roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                    });
                }
            }

            const channel = await interaction.guild!.channels.create({
                name: `🆕-skarga-${channelName}`,
                type: ChannelType.GuildText,
                parent: config.category.newTickets,
                permissionOverwrites,
                topic: `Ticket skargi od ${interaction.user.tag} (${interaction.user.id})`,
            });

            const channelEmbed = new EmbedBuilder()
                .setTitle(`${complaintType} - ${complaintSubject}`)
                .setColor(EmbedColors.denied)
                .setDescription(`**Opis skargi:**\n${complaintDescription}`)
                .setFooter({ text: `Zgłoszenie od ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            const rolePings = rolesIds
                .filter(roleId => roleId)
                .map(roleId => `<@&${roleId}>`)
                .join(' ');

            const controlMsg = await channel.send({
                content: rolePings,
                embeds: [channelEmbed],
                components: [createTicketButtons()]
            });

            await TicketCase.create({
                guildId: interaction.guildId!,
                channelId: channel.id,
                creatorId: interaction.user.id,
                controlMessageId: controlMsg.id,
                deleteAt: null,
            });

            const infoMessage = [
                `-# Stworzyłeś ticket ze skargą. Wszelkie informacje na temat skargi i dowody powinny być zamieszczone w wiadomości poniżej.`,
                ``,
                `-# Opiekunowie strefy zastrzegają sobie prawo do dodania do skragi liderów frakcji lub projektów, których dotyczy skarga, w celu wyjaśnienia sprawy.`,
                ``,
                `-# Opiekunowie strefy zastrzegają sobie prawo do dodania liderów frakcji lub projektów oraz osoby, na którą skarga została złożona, w celu wyjaśnienia sprawy.`,
                ``,
                `-# Wszystkie screeny, nagrania i logi, które zostaną dodane mogą zostać wykorzystane w celu wyjaśnienia sprawy.`,
            ].join('\n');

            await channel.send(infoMessage);

            await interaction.editReply({
                content: `✅ Twoje zgłoszenie zostało utworzone na kanale <#${channel.id}>.`
            });
        } catch (error) {
            logger.error(`Error handling complaintModal: ${error}`);
            await interaction.editReply({
                content: '❌ Wystąpił błąd podczas przetwarzania zgłoszenia. Spróbuj ponownie później.'
            })
        }
    }
}