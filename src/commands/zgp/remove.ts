import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags,
} from "discord.js";
import Zgp from "../../models/Zgp";
import { logger } from "../../utils/logger";
import { sendToChannel } from "../../utils/sendToChannel";

export const removeZgpSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("remove")
            .setDescription("Usuwa wpis z bazy danych na podstawie nickname użytkownika")
            .addUserOption(option =>
            option
                .setName("user")
                .setDescription('Wybierz użytkownika, któremu chcesz odebrać zgodę')
            ),


    async execute( interaction: ChatInputCommandInteraction ): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const targetUser = interaction.options.getUser("user", true);

        try {

            const deleted = await Zgp.findOneAndDelete({
                guildId: interaction.guildId,
                userId: targetUser.id,
            });

            if ( !deleted ) {
                await interaction.editReply({
                    content: `❌ Nie znaleziono zgody dla użytkownika <@${targetUser.id}>.`
                });
                return;
            }

            const successEmbed = new EmbedBuilder()
                .setColor(0x57f287)
                .setTitle("🗑️ Usunięto zgodę na grę w organizacji przestępczej")
                .addFields(
                    { name: "📦 Typ zgody", value: deleted.zgpType, inline: false },
                    { name: "👤 Użytkownik", value: `<@${deleted.userId}>`, inline: true },
                    { name: "🔗 Link do użytkownika", value: deleted.userLink, inline: true },
                    { name: "🔶 Główna grupa", value: deleted.mainGroup, inline: false },
                    { name: "🔗 Link do grupy przestępczej", value: deleted.crimeLink, inline: false },

                )
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({
                embeds: [successEmbed]
            });

            const logEmbed = new EmbedBuilder()
                .setColor(0x57f287)
                .setTitle("🗑️ Usunięto zgodę na grę w organizacji przestępczej")
                .addFields(
                    { name: "📦 Typ zgody", value: deleted.zgpType, inline: false },
                    { name: "👤 Użytkownik", value: `<@${deleted.userId}>`, inline: true },
                    { name: "🔗 Link do użytkownika", value: deleted.userLink, inline: true },
                    { name: "🔶 Główna grupa", value: deleted.mainGroup, inline: false },
                    { name: "🔗 Link do grupy przestępczej", value: deleted.crimeLink, inline: false },

                )
                .setTimestamp();

            if (interaction.guild) {
                await sendToChannel(interaction.guild, "logChannel", logEmbed);
            }

            logger.success(`Usunięto zgodę na grę w organizacji przestępczej [${targetUser}] w ${interaction.guildId} przez ${interaction.user.id}`);
        } catch ( error ) {
            logger.error(`Błąd podczas usuwania zgody: ${error}`);
            await interaction.editReply({
                content: `❌ Wystąpił błąd podczas usuwania zgody.`
            });
        }

    }
}