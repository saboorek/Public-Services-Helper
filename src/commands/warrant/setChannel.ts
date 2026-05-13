import {
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags
} from "discord.js";
import WarrantConfig from "../../models/WarrantConfig";
import { logger } from "../../utils/logger";
import { sendToChannel } from "../../utils/sendToChannel";

export const setChannelSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName('setchannel')
            .setDescription('Pozwala podpisać konkretny kanał do typu nakazu')
            .addStringOption(option =>
                option
                    .setName('type')
                    .setDescription('Wybierz typ nakazu, do którego chcesz przypisać kanał')
                    .setRequired(true)
                    .addChoices(
                        {
                        name: 'panel Channel',
                        value: 'panelChannel'
                        },
                        {
                        name: 'Arrest Warrant',
                        value: 'arrestChannel'
                        },
                        {
                        name: 'Search Warrant',
                        value: 'searchChannel'
                        },
                        {
                        name: 'Federal Warrant',
                        value: 'federalChannel'
                        },
                        {
                        name: 'Surveillance Warrant',
                        value: 'surveillanceChannel'
                        },
                        {
                        name: 'Wiretap Warrant',
                        value: 'wiretapChannel'
                        },
                        {
                        name: 'Vehicle Seizure Warrant',
                        value: 'seizureChannel'
                        },
                        {
                        name: 'Life Imprisonment Warrant',
                        value: 'lifeImprisonmentChannel'
                        },
                        {
                        name: '️Judicial Warrant',
                        value: 'judicialChannel'
                        },
                        {
                        name: 'Application for Order of Sale (IRS)',
                        value: 'appOrderSaleChannel'
                        },
                    )
            )
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription('Wybierz kanał, który chcesz przypisać do wybranego typu nakazu')
                    .setRequired(true)
            ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channelType = interaction.options.getString('type', true);
        const channel = interaction.options.getChannel('channel', true);

        if ( channel.type !== ChannelType.GuildText ) {
            await interaction.editReply({
                content: `❌ Wybrany kanał nie jest kanałem tekstowym. Proszę wybrać poprawny kanał.`
            });
            return;
        }

        try {
            let config = await WarrantConfig.findOne({ guildId: interaction.guildId });

            if (!config) {
                config = new WarrantConfig({ guildId: interaction.guildId });
            }

            switch ( channelType ) {
                case 'panelChannel':
                    config.panelChannelId = channel.id;
                    break;
                case 'arrestChannel':
                    config.warrants.arrestChannelId = channel.id;
                    break;
                case 'searchChannel':
                    config.warrants.searchChannelId = channel.id;
                    break;
                case 'federalChannel':
                    config.warrants.federalChannelId = channel.id;
                    break;
                case 'surveillanceChannel':
                    config.warrants.surveillanceChannelId = channel.id;
                    break;
                case 'wiretapChannel':
                    config.warrants.wiretapChannelId = channel.id;
                    break;
                case 'seizureChannel':
                    config.warrants.seizureChannelId = channel.id;
                    break;
                case 'lifeImprisonmentChannel':
                    config.warrants.lifeImprisonmentChannelId = channel.id;
                    break;
                case 'judicialChannel':
                    config.warrants.judicialChannelId = channel.id;
                    break;
                case 'appOrderSaleChannel':
                    config.warrants.appOrderSaleChannelId = channel.id;
                    break;
                default:
                    await interaction.editReply({
                        content: '❌ Wybrano nieprawidłowy typ kanału.'
                    });
                    return;
            }

            await config.save();

            const logEmbed = new EmbedBuilder()
                .setTitle('⚙️ Zaaktualizowano konfigurację kanałów')
                .setColor('#f8ef0d')
                .setDescription(`użytkownik <@${interaction.user.id}> przypisał kanał **${channelType.replace('Channel', '')}** na <#${channel.id}>`)
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()

            const logResult = await sendToChannel(interaction.guild, 'logChannel', logEmbed);

            if (!logResult.success) {
                logger.warn(`The Channel has beeen assigned but no logChannelId set for guild ${interaction.guildId}`);
            }

            await interaction.editReply({
                content: `✅ Poprawnie przypisano **${channelType.replace('Channel', '')}** do **${channel}**.`
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