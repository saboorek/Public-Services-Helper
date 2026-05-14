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
import { EmbedColors } from '../../config/colors'

export const appOrderSaleWarrantModal = {
    customId: 'appOrderSaleWarrantModal',

    async execute(interaction: ModalSubmitInteraction) {
        if (interaction.replied || interaction.deferred) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {

            const desc = interaction.fields.getTextInputValue('appOrderSaleWarrantDesc');
            const applicant = interaction.fields.getTextInputValue('appOrderSaleWarrantApplicant');
            const date = interaction.fields.getTextInputValue('appOrderSaleWarrantDate');
            const value = interaction.fields.getTextInputValue('appOrderSaleWarrantValue');
            const confirmation = interaction.fields.getTextInputValue('appOrderSaleWarrantConfirmation');

            const config = await WarrantConfig.findOne({ guildId: interaction.guildId });

            if (!config?.warrants?.categoryId) {
                await interaction.editReply({ content: '❌ Kategoria dla nakazów nie została skonfigurowana.' });
                return;
            }

            if (!config?.warrants?.appOrderSaleChannelId) {
                await interaction.editReply({ content: '❌ Kanał dla nakazów zajęcia pojazdu nie został skonfigurowany.' });
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

            const channel = await interaction.guild!.channels.create({
                name:`📄-f-aos-${channelSafeName}`,
                type: ChannelType.GuildText,
                parent: config.warrants.categoryId,
                permissionOverwrites,
            });

            await WarrantCase.create({
                channelId: channel.id,
                guildId: interaction.guildId,
                creatorId: interaction.user.id,
                type: 'appOrderSale',
                fields: [
                    { name: 'Data przejęcia nieruchomości:', value: date },
                    { name: 'Wartość długu podatkowego:', value: value },
                    { name: 'Potwierdzenie zajęcia nieruchomości (IRS):', value: confirmation },
                ]
            });

            const channelEmbed = new EmbedBuilder()
                .setTitle('🪙 Wniosek o wydanie nakazu sprzedaży (IRS)')
                .setColor(EmbedColors.info)
                .setFields(
                    { name: 'Opis nieruchomości:', value: desc, inline: false },
                    { name: 'Wnioskujący o zatwierdzenie sprzedaży:', value: applicant, inline: true },
                    { name: 'Data przejęcia nieruchomości:', value: date, inline: true },
                    { name: 'Wartość długu podatkowego:', value: value, inline: true },
                    { name: 'Potwierdzenie zajęcia nieruchomości przez IRS (screenshot wiadomości wysłanej na forum):', value: confirmation, inline: false },
                )
                .setTimestamp()

            await channel.send({
                embeds: [channelEmbed],
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

            const appOrderSaleChannel = await interaction.guild!.channels.fetch(config.warrants.appOrderSaleChannelId).catch( () => null ) as TextChannel | null;

            if (!appOrderSaleChannel) {
                await interaction.editReply({
                    content: '❌ Nie znaleziono kanału dla nakazów sprzedaży.'
                });
                return;
            }

            const reviewEmbed = new EmbedBuilder()
                .setTitle('🪙 Wniosek o wydanie nakazu sprzedaży (IRS)')
                .setColor(EmbedColors.waiting)
                .addFields(
                    { name: 'Opis nieruchomości:', value: desc, inline: false },
                    { name: 'Wnioskujący o zatwierdzenie sprzedaży:', value: applicant, inline: true },
                    { name: 'Data przejęcia nieruchomości:', value: date, inline: true },
                    { name: 'Wartość długu podatkowego:', value: value, inline: true },
                    { name: 'Potwierdzenie zajęcia nieruchomości przez IRS (screenshot wiadomości wysłanej na forum):', value: confirmation, inline: false },
                    { name: 'Kanał wnioskującego o nakaz:', value: `<#${channel.id}>`, inline: false }
                )
                .setTimestamp();

            const reviewRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`approve_${channel.id}`)
                    .setLabel('Zatwierdź')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`deny_${channel.id}`)
                    .setLabel('Odrzuć')
                    .setStyle(ButtonStyle.Danger)
            );

            await appOrderSaleChannel.send({
                embeds: [reviewEmbed],
                components: [reviewRow]
            });

            await interaction.editReply({
                content: `✅ Wniosek został złożony. Kanał: <#${channel.id}>`
            });
            logger.success(`Application for Order of Sale Warrant złożony przez ${interaction.user.id} w ${interaction.guildId}`);
        } catch (error) {
            logger.error(`Error creating Application for Order of Sale Warrant channel in guild ${interaction.guildId}: ${error}`);
            logger.error(`Błąd podczas przetwarzania wniosku o nakaz sprzedaży: ${error}`);
            await interaction.editReply({
                content: '❌ Wystąpił błąd podczas składania wniosku.'
            });
        }
    }


}