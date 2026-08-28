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

export const irsModal = {
    customId: 'irsModal',

    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        try {
            const irsTargetNickname = interaction.fields.getTextInputValue('irsTargetNickname');
            const irsApplicant = interaction.fields.getTextInputValue('irsApplicant');
            const irsDescription = interaction.fields.getTextInputValue('irsDescription');

            const config = await TicketsConfig.findOne({guildId: interaction.guildId});

            if (!config?.category.irsTickets) {
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
                config.supportRoles.irsRole,
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
                name: `💵〡irs-${channelName}`,
                type: ChannelType.GuildText,
                parent: config.category.irsTickets,
                permissionOverwrites: permissionOverwrites,
            });

            const channelEmbed = new EmbedBuilder()
                .setTitle(`Wniosek o kontrolę majątku`)
                .setColor(EmbedColors.info)
                .addFields(
                    { name: 'Imię i nazwisko osoby objętej wnioskiem:', value: `${irsTargetNickname}` },
                    { name: 'Imię i nazwisko, stopień i agencja wnioskującego:', value: `${irsApplicant}` },
                    { name: 'Uzasadnienie wniosku:', value: `${irsDescription}` },
                )
                .setFooter({ text: `Zgłoszenie od ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

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
                `-# właśnie utworzyłeś wniosek o kontrolę majątku. Opisz dokładnie swoją sprawę uwzględniając wszystkie niezbędne informacje.`,
                ``,
                `-# Jeśli twoja sprawa została rozwiązana wpisz komendę \`/ticket close [powód]\` lub kliknij w poniższy przycisk "🔒 Zamknij".`,
            ].join('\n');

            await channel.send(infoMessage);

            await interaction.editReply({
                content: `✅ Twoje zgłoszenie zostało utworzone na kanale <#${channel.id}>.`
            });
        } catch (error) {
            logger.error(`Error handling irsModal: ${error}`);
            await interaction.editReply({
                content: '❌ Wystąpił błąd podczas przetwarzania zgłoszenia. Spróbuj ponownie później.'
            })
        }
    }
}