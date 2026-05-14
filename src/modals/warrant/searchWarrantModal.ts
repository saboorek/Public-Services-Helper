import {
    ModalSubmitInteraction,
    EmbedBuilder,
    MessageFlags,
    PermissionFlagsBits,
    ChannelType,
    ActionRowBuilder,
    TextChannel, ButtonBuilder, ButtonStyle, Embed, ActionRow
} from "discord.js";
import { logger } from "../../utils/logger";
import WarrantConfig from "../../models/WarrantConfig";
import WarrantCase from "../../models/WarrantCase";
import { EmbedColors } from '../../config/colors';

export const searchWarrantModal = {
    customId: 'searchWarrantModal',

    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        if (interaction.replied || interaction.deferred) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {

            const narrative = interaction.fields.getTextInputValue('searchWarrantNarrative');
            const applicant = interaction.fields.getTextInputValue('searchWarrantApplicant');
            const place = interaction.fields.getTextInputValue('searchWarrantPlace');
            const items = interaction.fields.getTextInputValue('searchWarrantItem');

            const config = await WarrantConfig.findOne({ guildId: interaction.guildId });

            if (!config?.warrants?.categoryId) {
                await interaction.editReply({ content: '❌ Kategoria dla nakazów nie została skonfigurowana.' });
                return;
            }

            if (!config?.warrants?.searchChannelId) {
                await interaction.editReply({ content: '❌ Kanał dla nakazów przeszukania nie został skonfigurowany.' });
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
                config.role?.daoRoleId,
                config.role?.criminalDivisionRoleId,
                config.role?.helperRoleId,
                config.role?.supervisorRoleId,
            ];

            for (const roleId of roleIds) {
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
                name: `📄-sw-${channelSafeName}`,
                type: ChannelType.GuildText,
                parent: config.warrants.categoryId,
                permissionOverwrites,
            });

            logger.info(`Dane do zapisu: channelId=${channel.id}, guildId=${interaction.guildId}, creatorId=${interaction.user.id}`);

            await WarrantCase.create({
                channelId: channel.id,
                guildId: interaction.guildId,
                creatorId: interaction.user.id,
                type: 'search',
                fields: [
                    { name: 'Miejsce/mienie/osoby do przeszukania', value: place },
                    { name: 'Przedmioty które mają zostać przejęte', value: items },
                ]
            });

            const channelEmbed = new EmbedBuilder()
                .setTitle('🔎 Wniosek o nakaz przeszukania')
                .setColor(EmbedColors.info)
                .addFields(
                    { name: 'Narracja dot. Probable Cause oraz dowody:', value: narrative, inline: false },
                    { name: 'Wnioskujący o nakaz, pozycja oraz agencja:', value: applicant, inline: true },
                    { name: 'Miejsce/mienie/osoby do przeszukania:', value: place, inline: true },
                    { name: 'Przedmioty które mają zostać przejęte:', value: items, inline: true },
                )
                .setTimestamp()

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

            const searchChannel = await interaction.guild!.channels.fetch(config.warrants.searchChannelId).catch( () => null ) as TextChannel | null;

            if (!searchChannel) {
                await interaction.editReply({
                    content: '❌ Nie znaleziono kanału dla nakazów przeszukania.'
                });
                return;
            }

            const reviewEmbed = new EmbedBuilder()
                .setTitle('🔎 Wniosek o nakaz przeszukania')
                .setColor(EmbedColors.waiting)
                .addFields(
                    { name: 'Narracja dot. Probable Cause oraz dowody:', value: narrative, inline: false },
                    { name: 'Wnioskujący o nakaz, pozycja oraz agencja:', value: applicant, inline: true },
                    { name: 'Miejsce/mienie/osoby do przeszukania:', value: place, inline: true },
                    { name: 'Przedmioty które mają zostać przejęte:', value: items, inline: true },
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

            await searchChannel.send({
                embeds: [reviewEmbed],
                components: [row]
            });

            await interaction.editReply({
                content: `✅ Wniosek został złożony. Kanał: <#${channel.id}>`
            });
            logger.success(`Search warrant złożony przez ${interaction.user.id} w ${interaction.guildId}`);
        } catch (error) {
            logger.error(`Error creating search warrant channel in guild ${interaction.guildId}: ${error}`);
            logger.error(`Błąd podczas przetwarzania wniosku o nakaz przeszukania: ${error}`);
            await interaction.editReply({
                content: '❌ Wystąpił błąd podczas składania wniosku.'
            });
        }
    }
}