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
import { createCloseButton } from "../../utils/ticketButtons";
import TicketsConfig from "../../models/TicketsConfig";
import TicketCase from "../../models/TicketCase";
import tickets from "../../commands/tickets";

export const disciplinaryModal = {
    customId: 'disciplinaryModal',

    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        try {

            const disciplinaryDescription = interaction.fields.getTextInputValue('disciplinaryDescription');

            const config = await TicketsConfig.findOne({guildId: interaction.guildId});

            if (!config?.category.explanations) {
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
                name: `💀-wyjaśnienia-${channelName}`,
                type: ChannelType.GuildText,
                parent: config.category.explanations,
                permissionOverwrites: permissionOverwrites
            });

            const channelEmbed = new EmbedBuilder()
                .setTitle('Wyjaśnienia')
                .setDescription(`Oj nie fajnie.. I co żeś narobił? teraz będziesz mieć problem\n
                **Opis sprawy:** \n\`${disciplinaryDescription}\``)
                .setColor(EmbedColors.denied)
                .setFooter({ text: `System opresyjny dla graczy strefy publicznej`})
                .setTimestamp();

            const controlMsg = await channel.send({
                embeds: [channelEmbed],
                components: [createCloseButton()]
            });

            await TicketCase.create({
                guildId: interaction.guildId!,
                channelId: channel.id,
                creatorId: interaction.user.id,
                controlMessageId: controlMsg.id,
                deleteAt: null,
            });

            const message = [
                `https://images-ext-1.discordapp.net/external/IPRDh2bj-uTt7P3W8iL0hlsYZNe7woiNfWexqH_jntQ/https/media.tenor.com/aTljWQ18YeUAAAAd/rotating-skull.gif`
            ].join('\n');

            await channel.send(message);

            await interaction.editReply({
                content: `✅ Twoje zgłoszenie zostało utworzone na kanale <#${channel.id}>.`
            });
        } catch (error) {
            logger.error(`Error handling disciplinaryModal: ${error}`);
            await interaction.editReply({
                content: '❌ Wystąpił błąd podczas przetwarzania zgłoszenia. Spróbuj ponownie później.'
            })
        }
    }
}