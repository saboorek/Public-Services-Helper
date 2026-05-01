import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags
} from "discord.js";
import GuildConfig from "../../models/GuildConfig";
import { logger } from "../../utils/logger";
import { sendToChannel } from "../../utils/sendToChannel";

export const setDefaultRoleSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("setdefaultrole")
            .setDescription("Ustawia domyślną rolę nadawaną użytkownikom po dołączeniu na serwer")
            .addRoleOption(option =>
                option
                    .setName("role")
                    .setDescription("Rola do ustawienia jako domyślna")
                    .setRequired(true)
            ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const role = interaction.options.getRole("role", true);

        try {
            let config = await GuildConfig.findOne({ guildId: interaction.guildId });

            if (!config) {
                config = new GuildConfig({ guildId: interaction.guildId });
            }

            config.defaultRoleId = role.id;
            await config.save();

            const logEmbed = new EmbedBuilder()
                .setTitle("⚙️ Zaaktualizowano konfigurację ról")
                .setColor("#f8ef0d")
                .setDescription(`Użytkownik <@${interaction.user.id}> ustawił domyślną rolę na <@&${role.id}>`)
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            const logResult = await sendToChannel(interaction.guild, "logChannel", logEmbed);

            if (!logResult.success) {
                logger.warn(`Default role set but no logChannelId configured for guild ${interaction.guildId}`);
            }

            await interaction.editReply({
                content: `✅ Domyślna rola została ustawiona na **${role.name}**.`
            });

            logger.success(`Default role set to ${role.id} in guild ${interaction.guildId}`);
        } catch (error) {
            logger.error(`Error while setting default role: ${error}`);
            await interaction.editReply({
                content: "❌ Wystąpił błąd podczas ustawiania domyślnej roli."
            });
        }
    }
};