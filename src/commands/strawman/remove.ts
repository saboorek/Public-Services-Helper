import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags
} from "discord.js";
import Strawman from "../../models/Strawman";
import { logger } from "../../utils/logger";
import { sendToChannel } from "../../utils/sendToChannel";

export const removeStrawmanSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("remove")
            .setDescription("Usuwa wpis z bazy danych na podstawie typu i ID")
            .addStringOption(option =>
                option
                    .setName("type")
                    .setDescription("Typ przedmiotu")
                    .setRequired(true)
                    .addChoices(
                        { name: "Budynek", value: "Budynek" },
                        { name: "Pojazd", value: "Pojazd" },
                    )
            )
            .addStringOption(option =>
                option
                    .setName("id")
                    .setDescription("ID przedmiotu")
                    .setRequired(true)
            ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const strawmanType = interaction.options.getString("type", true);
        const itemId = interaction.options.getString("id", true);

        try {
            const deleted = await Strawman.findOneAndDelete({
                guildId: interaction.guildId,
                strawmanType,
                itemId,
            });

            if (!deleted) {
                await interaction.editReply({
                    content: `❌ Nie znaleziono wpisu typu **${strawmanType}** z ID \`${itemId}\`.`
                });
                return;
            }

            const successEmbed = new EmbedBuilder()
                .setColor(0x57f287)
                .setTitle("🗑️ Usunięto wpis")
                .addFields(
                    { name: "📦 Typ", value: deleted.strawmanType, inline: true },
                    { name: "🆔 ID przedmiotu", value: deleted.itemId, inline: true },
                    { name: "🔗 Link do forum", value: deleted.forumLink },
                    { name: "👤 Dodany przez", value: `<@${deleted.addedBy}>`, inline: true },
                )
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });

            const logEmbed = new EmbedBuilder()
                .setColor(0xed4245)
                .setTitle("🗑️ Usunięto wpis słupa")
                .setDescription(`Użytkownik <@${interaction.user.id}> usunął wpis`)
                .addFields(
                    { name: "📦 Typ", value: deleted.strawmanType, inline: true },
                    { name: "🆔 ID przedmiotu", value: deleted.itemId, inline: true },
                    { name: "🔗 Link do forum", value: deleted.forumLink },
                    { name: "👤 Dodany przez", value: `<@${deleted.addedBy}>`, inline: true },
                )
                .setTimestamp();

            if (interaction.guild) {
                await sendToChannel(interaction.guild, "logChannel", logEmbed);
            }

            logger.success(`Usunięto słupa [${strawmanType}/${itemId}] w ${interaction.guildId} przez ${interaction.user.id}`);
        } catch (error) {
            logger.error(`Błąd podczas usuwania słupa: ${error}`);
            await interaction.editReply({
                content: `❌ Wystąpił błąd podczas usuwania wpisu.`
            });
        }
    }
};