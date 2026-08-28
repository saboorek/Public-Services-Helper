import { SlashCommandSubcommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ChannelType, MessageFlags } from 'discord.js';
import TicketsConfig from "../../models/TicketsConfig";
import { logger } from "../../utils/logger";

export const setChannelSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder)=>
        sub
            .setName("setchannel")
            .setDescription("Ustawia kanały dla systemu ticketów.")
            .addStringOption(option =>
                option
                    .setName('type')
                    .setDescription('Wybierz typ kanału, który chcesz ustawić.')
                    .setRequired(true)
                    .addChoices(
                        {
                            name: 'Centrum zgłoszeń graczy',
                            value: 'playerSupport'
                        },
                        {
                            name: 'Procedury i Wnioski urzędowe',
                            value: 'officialRequest'
                        },
                        {
                            name: 'Panel wewnętrzny opiekunów',
                            value: 'supervisory'
                        },
                        {
                            name: 'Kanał Transryptów',
                            value: 'transcripts'
                        }
                    )
            )
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription('Wybierz kanał, który chcesz ustawić dla wybranego typu.')
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(true)
            ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const type = interaction.options.getString('type', true);
        const channel = interaction.options.getChannel('channel', true);

        if (channel.type !== ChannelType.GuildText) {
            await interaction.editReply({
                content: '❌ Wybrany kanał nie jest kanałem tekstowym. Proszę wybrać poprawny kanał.'
            });
            return;
        }

        try {
            let config = await TicketsConfig.findOne({ guildId: interaction.guildId });

            if (!config) {
                config = new TicketsConfig({ guildId: interaction.guildId });
            }

            switch (type) {
            case 'playerSupport':
                config.panelsChannel.playerSupport = channel.id;
                break;
            case 'officialRequest':
                config.panelsChannel.officialRequest = channel.id;
                break;
            case 'supervisory':
                config.panelsChannel.supervisory = channel.id;
                break;
            case 'transcripts':
                config.transcriptsChannel = channel.id;
                break;
            default:
                await interaction.editReply({
                    content: '❌ Nieprawidłowy typ kanału.'
                });
                return;
            }
            await config.save();
            await interaction.editReply({
                content: `✅ Kanał dla typu **${type}** został ustawiony na ${channel}.`
            });
        } catch (error) {
            logger.error(`Błąd podczas ustawiania kanału dla typu ${type}: ${error}`);
            await interaction.editReply({
                content: '❌ Wystąpił błąd podczas ustawiania kanału. Proszę spróbować ponownie później.'
            });
        }
    }
};