import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags
} from "discord.js";
import GuildConfig from "../../models/GuildConfig";
import RoleMapping from "../../models/RoleMapping";
import { logger } from "../../utils/logger";

export const showRoleSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("showrole")
            .setDescription("Wyświetla aktualnie przypisane role w bazie danych"),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const [config, mappings] = await Promise.all([
                GuildConfig.findOne({ guildId: interaction.guildId }),
                RoleMapping.find({ guildId: interaction.guildId }),
            ]);

            const embed = new EmbedBuilder()
                .setTitle("📋 Przypisane role")
                .setColor("#f8ef0d")
                .setTimestamp()
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            const defaultRoleText = config?.defaultRoleId
                ? `<@&${config.defaultRoleId}>`
                : "*Nie ustawiono*";

            embed.addFields({
                name: "🔰 Rola domyślna",
                value: defaultRoleText,
            });

            if (mappings.length === 0) {
                embed.addFields({
                    name: "🔗 Mapowania ról",
                    value: "*Brak zdefiniowanych mapowań*",
                });
            } else {
                const mappingLines = await Promise.all(
                    mappings.map(async (m, i) => {
                        const targetGuild = await interaction.client.guilds.fetch(m.targetGuildId).catch(() => null);
                        const guildName = targetGuild ? `${targetGuild.name}` : `\`${m.targetGuildId}\``;

                        return (
                            `**${i + 1}.** Serwer: **${guildName}**\n` +
                            `　Nadana rola: <@&${m.assignedRoleId}>`
                        );
                    })
                );

                const chunkSize = 5;
                for (let i = 0; i < mappingLines.length; i += chunkSize) {
                    const chunk = mappingLines.slice(i, i + chunkSize).join("\n\n");
                    embed.addFields({
                        name: i === 0 ? "🔗 Mapowania ról" : "\u200b",
                        value: chunk,
                    });
                }
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            logger.error(`Błąd podczas pobierania ról: ${error}`);
            await interaction.editReply({
                content: "❌ Wystąpił błąd podczas pobierania listy ról.",
            });
        }
    },
};