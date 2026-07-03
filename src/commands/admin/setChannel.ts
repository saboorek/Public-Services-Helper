import {
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags
} from "discord.js";
import GuildConfig from "../../models/GuildConfig";
import { logger } from "../../utils/logger";
import { sendToChannel } from '../../utils/sendToChannel';

export const setChannelSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("setchannel")
            .setDescription("Pozwala skonfigurować kanał do wysyłania embedów")
            .addStringOption(option =>
                option
                    .setName('type')
                    .setDescription('Wybierz typ kanału do ustawienia')
                    .setRequired(true)
                    .addChoices(
                        {
                            name: '📝 Logs',
                            value: 'logsChannel'
                        },
                        {
                            name: '🔐 Admin',
                            value: 'adminChannel'
                        },
                        {
                            name: '🔪 Zgody ZGP',
                            value: 'zgpChannel'
                        }
                    )
            )
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription('Select the channel to set for the chosen type')
                    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                    .setRequired(true)
            ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channelType = interaction.options.getString('type', true);
        const channel = interaction.options.getChannel('channel', true);

        if ( channel.type !== ChannelType.GuildText ) {
            await interaction.editReply({
                content: '❌ The selected channel must be text-based!'
            });
            return;
        }

        try {
            let config = await GuildConfig.findOne({guildId: interaction.guildId});

            if (!config) {
                config = new GuildConfig({guildId: interaction.guildId});
            }

            switch (channelType) {
                case 'logsChannel':
                    config.logChannelId = channel.id;
                    break;
                case 'adminChannel':
                    config.adminChannelId = channel.id;
                    break;
                case 'zgpChannel':
                    config.zgpChannelId = channel.id;
                    break;
            }

            await config.save();

            const logEmbed = new EmbedBuilder()
                .setTitle('⚙️ Zaaktualizowano konfigurację kanałów')
                .setColor('#f8ef0d')
                .setDescription(`użytkownik <@${interaction.user.id}> ustawił **${channelType.replace('Channel', '')}** na <#${channel.id}>`)
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            const logResult = await sendToChannel(interaction.guild, 'logChannel', logEmbed);

            if (!logResult.success) {
                logger.warn(`Event created but no logChannelId set for guild ${interaction.guildId}`);
            }

            await interaction.editReply({
                content: `✅ Successfully set the **${channelType.replace('Channel', '')}** to **${channel}**.`
            })
            logger.success(`Channel ${channelType} set to ${channel.id} in guild ${interaction.guildId}`);
        } catch (error) {
            logger.error(`Error while setting channel type: ${error}`);
            await interaction.editReply({
                content: '❌ An error occurred while setting the channel.'
            });
        }
    }
}