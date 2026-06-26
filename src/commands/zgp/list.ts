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
import Zgp from '../../models/Zgp'
import GuildConfig from '../../models/GuildConfig'

const PAGE_SIZE = 10;

export const listZgpSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("list")
            .setDescription("Wyświetla listę wszystkich osób ze zgodą na grę w grupach przestępczych"),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        const allItems = await Zgp.find({guildId: interaction.guildId}).sort({createdAt: -1});

        if (allItems.length === 0) {
            await interaction.editReply({content: "📭 Brak wpisów w bazie danych."});
            return;
        }

        const config = await GuildConfig.findOne({ guildId: interaction.guildId });

        const limitLea = config?.zgpLimits?.lea ?? 0;
        const limitRescue = config?.zgpLimits?.rescue ?? 0;

        const countLea = await Zgp.countDocuments({ guildId: interaction.guildId, zgpType: "LEA" });
        const countRescue = await Zgp.countDocuments({ guildId: interaction.guildId, zgpType: "RESCUE" });

        const leaLimitText = limitLea === 0 ? `\`${countLea}\` / Brak limitu` : `\`${countLea}\` / \`${limitLea}\``;
        const rescueLimitText = limitRescue === 0 ? `\`${countRescue}\` / Brak limitu` : `\`${countRescue}\` / \`${limitRescue}\``;

        const totalPages = Math.ceil(allItems.length / PAGE_SIZE);
        let currentPage = 0;

        const buildEmbed = (page: number) => {
            const start = page * PAGE_SIZE;
            const items = allItems.slice(start, start + PAGE_SIZE);

            const entriesList = items.map((item, i) => {
                const index = start + i + 1;
                const date = new Date(item.createdAt).toLocaleDateString('pl-PL');

                return (
                    `${index} — \`${item.zgpType}\`\n` +
                    `**Użytkownik:** <@${item.userId}> | [Profil](${item.userLink})\n` +
                    `**Główna grupa:** \`${item.mainGroup}\`\n` +
                    `**Grupa przestępcza:** [Link](${item.crimeLink})\n` +
                    `\n` +
                    `👤 **Dodał:** <@${item.addedBy}> • 📅 **Data:** ${date}`
                );
            }).join("\n\n---\n\n");

            const description =
                `📊 **Status wykorzystania limitów:**\n` +
                `• Sloty **LEA:** ${leaLimitText}\n` +
                `• Sloty **RESCUE:** ${rescueLimitText}\n\n` +
                `====================================\n\n` +
                entriesList;

            return new EmbedBuilder()
                .setColor(0xf8ef0d)
                .setTitle("📋 Lista zgód na grę w grupie przestępczej")
                .setDescription(description)
                .setFooter({text: `Strona ${page + 1}/${totalPages} • Łącznie: ${allItems.length} wpisów`})
                .setTimestamp();
        };

        const buildRow = (page: number) =>
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId("zgp_prev")
                    .setLabel("◀ Poprzednia")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId("zgp_next")
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
            if (i.customId === "zgp_prev") currentPage--;
            if (i.customId === "zgp_next") currentPage++;

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