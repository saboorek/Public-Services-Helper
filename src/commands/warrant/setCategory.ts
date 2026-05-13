import { SlashCommandSubcommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ChannelType, MessageFlags } from 'discord.js';
import WarrantConfig from "../../models/WarrantConfig";
import { logger } from "../../utils/logger"
import { sendToChannel } from "../../utils/sendToChannel";

export const setCategorySubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName('setcategory')
            .setDescription('Ustawia kategorię dla określonych kanałów systemowych.')
            .addStringOption(option =>
                option
                    .setName('type')
                    .setDescription('Wybierz typ kategorii do ustawienia')
                    .setRequired(true)
                    .addChoices(
                        {
                            name: '📝 Warrant Category',
                            value: 'warrantCategory'
                        },
                    )
            )
            .addChannelOption(option =>
            option
                .setName('category')
                .setDescription('Wybierz kategorię do ustawienia dla wybranego typu')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
            ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        const categoryType = interaction.options.getString('type', true);
        const category = interaction.options.getChannel('category', true);

        if (category.type !== ChannelType.GuildCategory) {
            await interaction.editReply({
                content: '❌ Wybrany kanał nie jest kategorią. Proszę wybrać poprawną kategorię.'
            });
            return;
        }

        try {
            let config = await WarrantConfig.findOne({ guildId: interaction.guildId });

            if (!config) {
                config = new WarrantConfig({guildId: interaction.guildId});
            }

            switch (categoryType) {
                case 'warrantCategory':
                    config.warrants.categoryId = category.id;
                    break;
                default:
                    await interaction.editReply({
                        content: '❌ Nieprawidłowy typ kategorii.'
                    });
                    return;
            }

            await config.save();

            const logEmbed = new EmbedBuilder()
                .setTitle(`⚙️ Zaaktualizowano ustawienie kategorii`)
                .setColor('#f8ef0d')
                .setDescription(`Kategoria **${categoryType.replace('Category', '')}** została ustawiona na <#${category.id}> przez ${interaction.user.tag}.`)
                .setFooter({text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                .setTimestamp()

            const logResult = await sendToChannel(interaction.guild, 'logChannel', logEmbed);

            if (!logResult.success) {
                logger.warn(`Category updated but no logChannelId set for guild ${interaction.guildId}`);
            }

            await interaction.editReply({
                content: `✅ Kategoria **${categoryType.replace('Category', '')}** została pomyślnie ustawiona na <#${category.id}>.`
            });

            logger.success(`User ${interaction.user.tag} set category ${category.id} as ${categoryType} in guild ${interaction.guildId}`);
        } catch (error) {
            logger.error(`Error setting category in guild ${interaction.guildId}: ${error}`);
            await interaction.editReply({
                content: '❌ Wystąpił błąd podczas ustawiania kategorii.'
            });
        }
    }

}