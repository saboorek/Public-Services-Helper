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
import WarrantConfig from "../../models/WarrantConfig";
import WarrantCase from "../../models/WarrantCase";
import { EmbedColors } from '../../config/colors';

export const wiretapWarrantModal = {
    customId: 'wiretapWarrantModal',

    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        if (interaction.replied || interaction.deferred) return;

        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        try {
            const narrative = interaction.fields.getTextInputValue('wiretapWarrantNarrative');
            const applicant = interaction.fields.getTextInputValue('wiretapWarrantApplicant');
            const suspect = interaction.fields.getTextInputValue('wiretapWarrantSuspect');

            const config = await WarrantConfig.findOne({guildId: interaction.guildId});

            if (!config?.warrants?.categoryId) {
                await interaction.editReply({content: '❌ Kategoria dla nakazów nie została skonfigurowana.'});
                return;
            }

            if (!config?.warrants?.wiretapChannelId) {
                await interaction.editReply({content: '❌ Kanał dla nakazów podsłuchu nie został skonfigurowany.'});
                return;
            }

            const channelSafeName = applicant
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .trim()
                .replace(/\s+/g, '-')
                .slice(0, 50);

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

            const roleIds = [
                config.role?.helperRoleId,
                config.role?.supervisorRoleId,
            ];

            for (const roleId of roleIds) {
                if (roleId) {
                    permissionOverwrites.push({
                        od: roleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                    });
                }
            }

            const channel = await interaction.guild!.channels.create({
                name: `📄-ph-${channelSafeName}`,
                type: ChannelType.GuildText,
                parent: config.warrants.categoryId,
                permissionOverwrites,
            });

            await WarrantCase.create({
                channelId: channel.id,
                guildId: interaction.guildId,
                creatorId: interaction.user.id,
                type: 'wiretap',
                fields: [
                    { name: '🎯 Osoba objęta nakazem:', value: suspect },
                ]
            });

            const channelEmbed = new EmbedBuilder()
                .setTitle('☎️ Wniosek o otrzymanie numeru telefonu')
                .setColor(EmbedColors.info)
                .addFields(
                    { name: 'Narracja dot. Probable Casue oraz dowody:', value: narrative, inline: false },
                    { name: 'Wnioskujący o nakaz, pozycja oraz agencja:', value: applicant, inline: true },
                    { name: 'Osoba objęta nakazem:', value: suspect, inline: true },
                )
                .setTimestamp();

            await channel.send({
                embeds: [channelEmbed]
            });

            const infoMessage = [
                `-# Twój wniosek o nakaz został pomyślnie stworzony! Komunikacja na tym kanale odbywa się wyłącznie w formie IC z pomocą odpowiednich narracji, które należy umieścić w **pogrubionej czcionce**. Komunikacja OOC jest dozwolona jedynie za użyciem ((__ podwójnych nawiasów __)). Przy pisaniu narracji, pamiętaj aby pierw umieścić dane swojej postaci oraz do kogo kierowana jest narracja.`,
                ``,
                `> -# **SGT. John Doe skontaktował się z Judge Jane Doe w sprawie (...)** lub **SGT. John Doe odpowiadając na zadane pytanie przez Judge Jane Doe, odpowiedział (...)**`,
                ``,
                `-# Dodatkowo kanał ten służy do zamieszczania materiału dowodowego (w formie narracji/screenów/logów) oraz dodatkowych informacji, które pomogą w rozpatrzeniu wniosku. Takowe należy załączać również za pomocą narracji stosując **pogrubioną czcionkę**.`,
                ``,
                `-# :bangbang: Stworzony kanał służy jednie do ewentualnego umieszczenia __dodatkowych__ informacji - załączenie takowych jest dobrowolne i __nie spowoduje__ automatycznego odrzucenia wniosku. Jest to też prosta forma kontaktu z sądem, bądź też inną instytucją rządową. :bangbang:`,
            ].join('\n');

            await channel.send(infoMessage);

            const wiretapChannel = await interaction.guild!.channels.fetch(config.warrants.wiretapChannelId).catch( () => null ) as TextChannel | null;

            if (!wiretapChannel) {
                await interaction.editReply({
                    content: '❌ Nie znaleziono kanału dla wniosku uzyskania numeru telefonu.'
                });
                return;
            }

            const reviewEmbed = new EmbedBuilder()
                .setTitle('☎️ Wniosek o otrzymanie numeru telefonu')
                .setColor(EmbedColors.waiting)
                .addFields(
                    { name: 'Narracja dot. Probable Casue oraz dowody:', value: narrative, inline: false },
                    { name: 'Wnioskujący o nakaz, pozycja oraz agencja:', value: applicant, inline: true },
                    { name: 'Osoba objęta nakazem:', value: suspect, inline: true },
                    {name: 'Kanał wnioskującego o nakaz:', value: `<#${channel.id}>`, inline: false}
                )
                .setTimestamp();

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`approve_${channel.id}`)
                    .setLabel('Zatwierdź')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`deny_${channel.id}`)
                    .setLabel('Odrzuć')
                    .setStyle(ButtonStyle.Danger)
            );

            await channel.send({
                embeds: [reviewEmbed],
                components: [row]
            });

            await interaction.editReply({
                content: `✅ Wniosek został złożony. Kanał: <#${channel.id}>`
            });
            logger.success(`Wiretap warrant złożony przez ${interaction.user.id} w ${interaction.guildId}`);
        } catch (error) {
            logger.error(`Error creating wiretap warrant channel in guild ${interaction.guildId}: ${error}`);
            logger.error(`Błąd podczas przetwarzania wniosku o nakaz podsłuchu: ${error}`);
            await interaction.editReply({
                content: '❌ Wystąpił błąd podczas składania wniosku.'
            });
        }
    }
}