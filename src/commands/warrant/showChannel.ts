import {ChatInputCommandInteraction, SlashCommandSubcommandBuilder, EmbedBuilder, MessageFlags} from "discord.js";
import WarrantConfig from "../../models/WarrantConfig";
import { logger } from "../../utils/logger";

export const showChannelSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName('showchannel')
            .setDescription('Wyświetla listę przypisanych kanałów i kategorii'),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {

            const config = await WarrantConfig.findOne({guildId: interaction.guildId});
            if (!config) {
                await interaction.editReply({
                    content: '❌ No configuration found for this server.'
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('Przypisane kanały')
                .setColor(0x00AE86)
                .addFields(
                    {
                        name: '📄 Warrants Application Category',
                        value: config.warrants.categoryId ? `<#${config.warrants.categoryId}>` : 'Not set',
                        inline: false
                    },
                    {
                        name: '⛓️‍💥 Arrest Warrant',
                        value: config.warrants.arrestChannelId ? `<#${config.warrants.arrestChannelId}>` : 'Not set',
                        inline: false
                    },
                    {
                        name: '🔎 Search Warrant',
                        value: config.warrants.searchChannelId ? `<#${config.warrants.searchChannelId}>` : 'Not set',
                        inline: false
                    },
                    {
                        name: '🕶️ Federal Warrant',
                        value: config.warrants.federalChannelId ? `<#${config.warrants.federalChannelId}>` : 'Not set',
                        inline: false
                    },
                    {
                        name: '🎧 Surveillance Warrant',
                        value: config.warrants.surveillanceChannelId ? `<#${config.warrants.surveillanceChannelId}>` : 'Not set',
                        inline: false
                    },
                    {
                        name: '☎️ Wiretap Warrant',
                        value: config.warrants.wiretapChannelId ? `<#${config.warrants.wiretapChannelId}>` : 'Not set',
                        inline: false
                    },
                    {
                        name: '🚗 Vehicle Seizure Warrant',
                        value: config.warrants.seizureChannelId ? `<#${config.warrants.seizureChannelId}>` : 'Not set',
                        inline: false
                    },
                    {
                        name: '🔒 Life Imprisonment Warrant',
                        value: config.warrants.lifeImprisonmentChannelId ? `<#${config.warrants.lifeImprisonmentChannelId}>` : 'Not set',
                        inline: false
                    },
                    {
                        name: '👨‍⚖️ Judicial Warrant',
                        value: config.warrants.judicialChannelId ? `<#${config.warrants.judicialChannelId}>` : 'Not set',
                        inline: false
                    },
                    {
                        name: '🪙 Application for Order of Sale (IRS)',
                        value: config.warrants.appOrderSaleChannelId ? `<#${config.warrants.appOrderSaleChannelId}>` : 'Not set',
                        inline: false
                    },
                )
                .setTimestamp()

            await interaction.editReply({
                embeds: [embed]
            });
            logger.info(`Channel configuration displayed for guild ${interaction.guildId}`);
        } catch (error) {
            logger.error(`Error fetching channel configuration for guild ${interaction.guildId}: ${error}`);
            await interaction.editReply({
                content: `❌ An error occurred while fetching the channel configuration.`
            })
        }
    }
}