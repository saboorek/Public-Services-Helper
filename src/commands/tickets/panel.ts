import {
    SlashCommandSubcommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    TextChannel
} from 'discord.js';
import TicketsConfig from "../../models/TicketsConfig";
import { logger } from "../../utils/logger";
import { EmbedColors } from '../../config/colors';

export const panelSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("panel")
            .setDescription("Wyświetla panel zgłaszania ticketów.")
            .addStringOption(option =>
            option
                .setName('typ')
                .setDescription('Wybierz typ panelu, który chcesz wyświetlić.')
                .setRequired(true)
                .addChoices(
                    { name: '🤝 Centrum Zgłoszeń Graczy', value: 'playerSupport' },
                    { name: '📝 Wniosek oficjalny', value: 'officialRequest' },
                    { name: '🔒 Panel wewnętrzny opiekunów', value: 'supervisory' }
                )
            ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const type = interaction.options.getString('typ', true) as 'playerSupport' | 'officialRequest' | 'supervisory';
            const config = await TicketsConfig.findOne({ guildId: interaction.guildId });

            if (!config?.panelsChannel[type]) {
                await interaction.editReply({
                    content: '❌ Kanał panelu nie został skonfigurowany. Użyj `/admin setchannel` aby go ustawić.'
                });
                return;
            }

            const channelId = config.panelsChannel[type]!;
            const panelChannel = await interaction.guild?.channels.fetch(channelId).catch(() => null);

            if (!panelChannel || !( panelChannel instanceof TextChannel)) {
                await interaction.editReply({
                    content: '❌ Nie znaleziono skonfigurowanego kanału panelu lub nie jest kanałem tekstowym.'
                });
                return;
            }

            if (type === 'playerSupport') {
                const embed = new EmbedBuilder()
                    .setTitle("Centrum Zgłoszeń Graczy")
                    .setColor(EmbedColors.info)
                    .setDescription('Wybierz jeden z poniższych przycisków, aby utowrzyć nowy ticket:\n\n' +
                        '**🧑🏻‍👨🏻‍👦🏻 Sprawa do opiekunów organizacji publicznych** - Tworzy Ticket do opiekunów organizacji publicznych dotyczący strefy publicznej\n\n' +
                        '**👮 Sprawa do opiekuna LEA** - Tworzy Ticket do opiekuna LEA, dotyczy spraw dotyczących LEA\n\n' +
                        '**🧑‍🚒 Sprawa do opiekuna RESCUE** - Tworzy Ticket do opiekuna RESCUE, dotyczy spraw dotyczących RESCUE\n\n' +
                        '**⚖️ Wnioski do sądu** - Tworzy Ticket do opiekunów organizacji publicznych, dotyczy wniosków do sądu\n\n' +
                        '**⛔ Skargi** - Tworzy Ticket do opiekunów organizacji publicznych, dotyczy skarg na graczy lub organizacje publiczne\n\n' +
                        '**💡 Pomysły** - Tworzy Ticket do opiekunów organizacji publicznych, dotyczy pomysłów na rozwój strefy\n\n' +
                        '**📟 MDC** - Tworzy Ticket do opiekunów organizacji publicznych, dotyczy problemów z MDC\n\n' +
                        '**🔫 Wniosek o zgodę na grę we frakcji i w organizacji przestępczej** - Tworezy ticket do opiekunów organizacji publicznych, dotyczy wniosków o zgodę na grę we frakcji i w organizacji przestępczej'
                    )
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild?.name ?? "",
                        iconURL: interaction.guild?.iconURL() ?? undefined
                    });

                const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_public_org')
                        .setLabel('🧑🏻‍👨🏻‍👦🏻 Sprawa do opiekunów organizacji publicznych')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_lea')
                        .setLabel('👮 Sprawa do opiekuna LEA')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_rescue')
                        .setLabel('🧑‍🚒 Sprawa do opiekuna RESCUE')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_court_request')
                        .setLabel('⚖️ Wnioski do sądu')
                        .setStyle(ButtonStyle.Secondary)
                )
                const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_complaint')
                        .setLabel('⛔ Skargi')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_idea')
                        .setLabel('💡 Pomysły')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_mdc')
                        .setLabel('📟 MDC')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_org_crime')
                        .setLabel('🔫 Wniosek o zgodę na grę we frakcji i w organizacji przestępczej')
                        .setStyle(ButtonStyle.Secondary)
                )

                await panelChannel.send({ embeds: [embed], components: [row1, row2] });
                await interaction.editReply({ content: `✅ Panel **Centrum Zgłoszeń Graczy** został pomyślnie wysłany na ${panelChannel}.` });

            } else if (type === 'officialRequest') {
                const embed = new EmbedBuilder()
                    .setTitle("Wniosek oficjalny")
                    .setColor(EmbedColors.info)
                    .setDescription('Wybierz jeden z poniższych przycisków, aby utowrzyć nowy ticket:\n\n' +
                        '💰 Wniosek o kontrolę majątku (IRS) - Tworzy tikcet z wnioskiem o kontrolę majątku\n\n' +
                        '📄 Report (na wniosek osób z sądu) - Tworzy ticket o uzyskanie linku do uniwersalnego raportu \n\n' +
                        '💼 Wniosek do instytucji publicznej - Tworzy ticket z wnioskiem do instytucji publicznej'
                    )
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild?.name ?? "",
                        iconURL: interaction.guild?.iconURL() ?? undefined
                    });

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_irs')
                        .setLabel('💰 Wniosek o kontrolę majątku (IRS)')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_report')
                        .setLabel('📄 Report (na wniosek osób z sądu)')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_public_institution')
                        .setLabel('💼 Wniosek do instytucji publicznej')
                        .setStyle(ButtonStyle.Success)
                )

                await panelChannel.send({ embeds: [embed], components: [row] });
                await interaction.editReply({ content: `✅ Panel **Wniosek oficjalny** został pomyślnie wysłany na ${panelChannel}.` });

            } else if (type === 'supervisory') {
                const embed = new EmbedBuilder()
                    .setTitle("Panel wewnętrzny opiekunów")
                    .setColor(EmbedColors.info)
                    .setDescription('Wybierz jeden z poniższych przycisków, aby utowrzyć nowy ticket:\n\n' +
                        '👮 Dirty Cop - Tworzy kanał dla postaci Dirty Cop\n\n' +
                        '💀 Dywanik - Tworzy ticket, zaciągający niesfornych graczy przed oblicze Opiekuna'
                    )
                    .setTimestamp()
                    .setFooter({
                        text: interaction.guild?.name ?? "",
                        iconURL: interaction.guild?.iconURL() ?? undefined
                    });

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_dirty_cop')
                        .setLabel('👮 Dirty Cop')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('btn_ticket_disciplinary')
                        .setLabel('💀 Dywanik')
                        .setStyle(ButtonStyle.Secondary)
                )
                await panelChannel.send({ embeds: [embed], components: [row] });
                await interaction.editReply({ content: `✅ Panel **Panel wewnętrzny opiekunów** został pomyślnie wysłany na ${panelChannel}.` });
            }
        } catch {

        }
    }
}
