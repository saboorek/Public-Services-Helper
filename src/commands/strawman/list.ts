import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    ComponentType
} from "discord.js";
import Strawman from "../../models/Strawman";

const PAGE_SIZE = 10;

export const listStrawmanSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("list")
            .setDescription("Wyświetla listę nieruchomości i pojazdów zarejestrowanych na słupa"),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const allItems = await Strawman.find({ guildId: interaction.guildId }).sort({ createdAt: -1 });

        if (allItems.length === 0) {
            await interaction.editReply({ content: "📭 Brak wpisów w bazie danych." });
            return;
        }

        const totalPages = Math.ceil(allItems.length / PAGE_SIZE);
        let currentPage = 0;

        const buildEmbed = (page: number) => {
            const start = page * PAGE_SIZE;
            const items = allItems.slice(start, start + PAGE_SIZE);

            const description = items.map((item, i) =>
                `**${start + i + 1}.** \`${item.strawmanType}\` — ID: \`${item.itemId}\`\n` +
                `　Dodał: <@${item.addedBy}> • [Forum](${item.forumLink})\n` +
                `　📅 ${new Date(item.createdAt).toLocaleDateString('pl-PL')}`
            ).join("\n\n");

            return new EmbedBuilder()
                .setColor(0xf8ef0d)
                .setTitle("📋 Lista słupów")
                .setDescription(description)
                .setFooter({ text: `Strona ${page + 1}/${totalPages} • Łącznie: ${allItems.length} wpisów` })
                .setTimestamp();
        };

        const buildRow = (page: number) =>
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId("strawman_prev")
                    .setLabel("◀ Poprzednia")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId("strawman_next")
                    .setLabel("Następna ▶")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === totalPages - 1),
            );

        const response = await interaction.editReply({
            embeds: [buildEmbed(currentPage)],
            components: totalPages > 1 ? [buildRow(currentPage)] : [],
        });

        if (totalPages <= 1) return;

        // Kolektor przycisków — aktywny 2 minuty
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: i => i.user.id === interaction.user.id,
            time: 120_000,
        });

        collector.on("collect", async i => {
            if (i.customId === "strawman_prev") currentPage--;
            if (i.customId === "strawman_next") currentPage++;

            await i.update({
                embeds: [buildEmbed(currentPage)],
                components: [buildRow(currentPage)],
            });
        });

        collector.on("end", async () => {
            await interaction.editReply({ components: [] }).catch(() => {});
        });
    }
};