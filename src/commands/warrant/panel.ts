import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    TextChannel
} from "discord.js";
import WarrantConfig from "../../models/WarrantConfig";
import { logger } from "../../utils/logger";
import { EmbedColors } from '../../config/colors';

export const panelSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("panel")
            .setDescription("Wyświetla panel zgłaszania nakazów."),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral});

        try {
            const config = await WarrantConfig.findOne({ guildId: interaction.guildId});

            if (!config?.panelChannelId) {
                await interaction.editReply({
                    content: '❌ Kanał panelu nie został skonfigurowany. Użyj `/warrant setchannel` aby go ustawić.'
                });
                return;
            }

            const panelChannel = await interaction.guild?.channels.fetch(config.panelChannelId).catch(() => null);

            if (!panelChannel || !(panelChannel instanceof TextChannel)) {
                await interaction.editReply({
                    content: '❌ Nie znaleziono skonfigurowanego kanału panelu lub nie jest kanałem tekstowym.'
                })
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("Wniosek o wydanie nakazu")
                .setColor(EmbedColors.info)
                .setDescription('Wypełnij poniższy formularz, aby złożyć wniosek o wydanie interesującego Ciebie nakazu')
                .setTimestamp()
                .setFooter({ text: interaction.guild?.name ?? "", iconURL: interaction.guild?.iconURL() ?? undefined });

            const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('arrest_warrant')
                    .setLabel('⛓️‍💥 Arrest Warrant')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('search_warrant')
                    .setLabel('🔎 Search Warrant')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('surveillance_warrant')
                    .setLabel('🛰️ Surveillance/Electronic Communications Warrant')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('wiretap_warrant')
                    .setLabel('☎️ Wiretap')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('lifeImprisonment_warrant')
                    .setLabel('⚰️ Life Imprisonment Warrant')
                    .setStyle(ButtonStyle.Secondary),
            );

            const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('seizure_warrant')
                    .setLabel('🚗 Vehicle Seizure Warrant')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('judicial_warrant')
                    .setLabel('⚖️ Judicial Warrant')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('appordersale_warrant')
                    .setLabel('🪙 Application for Order of Sale (IRS)')
                    .setStyle(ButtonStyle.Secondary),
            );

            await panelChannel.send({embeds: [embed], components: [row1, row2]});

            await interaction.editReply({ content: `✅ Panel nakazów został wysłany na kanał <#${config.panelChannelId}>.` });
            logger.success(`Panel nakazów wysłany na kanał ${config.panelChannelId} w ${interaction.guildId}`);
        } catch (error) {
            logger.error(`Błąd podczas wysyłania panelu: ${error}`);
            await interaction.editReply({ content: "❌ Wystąpił błąd podczas wysyłania panelu." });
        }

    }
}