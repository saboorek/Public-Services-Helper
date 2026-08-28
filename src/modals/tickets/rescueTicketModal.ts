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

export const rescueTicketModal = {
    customId: 'rescueTicketModal',

    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        try {

            const rescueTicketDescription = interaction.fields.getTextInputValue('rescueTicketDescription');

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
                config.supportRoles.rescueManager,
                config.supportRoles.rescueAssistant,
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
                name: `🆕-rescue-${channelName}`,
                type: ChannelType.GuildText,
                parent: config.category.newTickets,
                permissionOverwrites: permissionOverwrites
            });

            const channelEmbed = new EmbedBuilder()
                .setTitle(`Zgłoszenie do opiekuna RESCUE`)
                .setColor(EmbedColors.info)
                .setDescription(`**Opis sprawy: **\n\`${rescueTicketDescription}\``)
                .setFooter({ text: `Zgłoszenie od ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()

            const rolePings = rolesIds
                .filter(roleId => roleId)
                .map(roleId => `<@&${roleId}>`)
                .join(' ');

            const controlMsg = await channel.send({
                //content: rolePings,
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
                `-# własnie stworzyłeś zgłoszenie z indywidualną sprawą do opiekuna RESCUE. Opisz dokładnie swoją sprawę uwzględniając niezbędne informacje.`,
                ``,
                `-# Jeśli twoja sprawa została rozwiązana wpisz komendę \`/ticket close [powód]\` lub kliknij w poniższy przycisk "🔒 Zamknij".`,
            ].join('\n');

            await channel.send(infoMessage);

            await interaction.editReply({
                content: `✅ Twoje zgłoszenie zostało utworzone na kanale <#${channel.id}>.`
            });
        } catch (error) {
            logger.error(`Error handling rescueTicketModal: ${error}`);
            await interaction.editReply({
                content: '❌ Wystąpił błąd podczas przetwarzania zgłoszenia. Spróbuj ponownie później.'
            })
        }
    }
}