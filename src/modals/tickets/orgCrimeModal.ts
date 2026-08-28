import {
    ModalSubmitInteraction,
    EmbedBuilder,
    MessageFlags,
    PermissionFlagsBits,
    ChannelType
} from "discord.js";
import { logger } from "../../utils/logger";
import { EmbedColors } from "../../config/colors";
import { toChannelSafeName} from "../../utils/channelName";
import { createTicketButtons } from "../../utils/ticketButtons";
import TicketsConfig from "../../models/TicketsConfig";
import TicketCase from "../../models/TicketCase";

export const orgCrimeModal = {
    customId: 'orgCrimeModal',

    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        try {

            const applicantAccountLink = interaction.fields.getTextInputValue('applicantAccountLink');
            const applicantFaction = interaction.fields.getTextInputValue('applicantFaction');
            const applicantOrganization = interaction.fields.getTextInputValue('applicantOrganization');
            const organizationLink = interaction.fields.getTextInputValue('organizationLink');

            const config = await TicketsConfig.findOne({guildId: interaction.guildId});

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
                        PermissionFlagsBits.ViewChannel,
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
                name: `🆕-org-crime-${channelName}`,
                type: ChannelType.GuildText,
                parent: config.category.newTickets,
                permissionOverwrites: permissionOverwrites,
            });

            const channelEmbed = new EmbedBuilder()
                .setTitle(`Wniosek o zgodę na grę we frakcji i organizacji przestępczej`)
                .setColor(EmbedColors.info)
                .addFields(
                    { name: `Wnioskujący:`, value: `\`${interaction.user.tag} (${interaction.user.id})\``, inline: false },
                    { name: 'Link do konta na forum:', value: `\`${applicantAccountLink}\``, inline: false },
                    { name: 'Frakcja:', value: `\`${applicantFaction}\``, inline: false },
                    { name: 'Organizacja:', value: `\`${applicantOrganization}\``, inline: false },
                    { name: 'Link do tematu organizacji:', value: `\`${organizationLink}\``, inline: false }
                )
                .setFooter({ text: `Zgłoszenie od ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()

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
                `-# Hej <@${interaction.user.id}>!`,
                ``,
                `-# własnie stworzyłeś Wniosek o zgodę na grę we frakcji i w organizacji przestępczej. Oczekuj na informację od opiekunów strefy.`,
                ``,
                `-# Jeśli twoja sprawa została rozwiązana wpisz komendę \`/ticket close [powód]\` lub kliknij w poniższy przycisk "🔒 Zamknij".`,
            ].join('\n');

            await channel.send(infoMessage);

            await interaction.editReply({
                content: `✅ Twoje zgłoszenie zostało utworzone na kanale <#${channel.id}>.`
            });
        } catch (error) {
            logger.error(`Error handling orgCrimeModal: ${error}`);
            await interaction.editReply({
                content: '❌ Wystąpił błąd podczas przetwarzania zgłoszenia. Spróbuj ponownie później.'
            });
        }
    }
}