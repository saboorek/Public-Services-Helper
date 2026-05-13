import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags
} from "discord.js";
import WarrantConfig from "../../models/WarrantConfig";
import { logger } from "../../utils/logger";

export const showRoleSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("showrole")
            .setDescription("Wyświetla aktualnie przypisane role w bazie danych"),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const config = await WarrantConfig.findOne({ guildId: interaction.guildId });

            const r = (id?: string | null) => id ? `<@&${id}>` : "*Nie ustawiono*";

            const embed = new EmbedBuilder()
                .setTitle("📋 Przypisane role — Warrant")
                .setColor("#f8ef0d")
                .setTimestamp()
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .addFields(
                    { name: "⚖️ DAO", value: r(config?.role?.daoRoleId), inline: false },
                    { name: "🔍 Criminal Division", value: r(config?.role?.criminalDivisionRoleId), inline: false },
                    { name: "🏛️ Leader FBI", value: r(config?.role?.leaderFbiRoleId), inline: false },
                    { name: "🤝 Helper", value: r(config?.role?.helperRoleId), inline: false },
                    { name: "👔 Supervisor", value: r(config?.role?.supervisorRoleId), inline: false },
                );

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            logger.error(`Błąd podczas pobierania ról: ${error}`);
            await interaction.editReply({
                content: "❌ Wystąpił błąd podczas pobierania listy ról.",
            });
        }
    },
};