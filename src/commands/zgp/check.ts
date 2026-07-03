import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags,
} from "discord.js";
import Zgp from "../../models/Zgp";
import { logger } from "../../utils/logger";

export const checkZgpSubcommand = {
    data: (sub: SlashCommandSubcommandBuilder) =>
        sub
            .setName("check")
            .setDescription("Sprawdza, czy użytkownik ma zgodę na grę w grupie przestępczej")
            .addUserOption(option =>
                option
                    .setName("user")
                    .setDescription("Użytkownik, którego chcesz sprawdzić")
                    .setRequired(true)
            ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const targetUser = interaction.options.getUser("user", true);

        try {
            const data = await Zgp.findOne({
                guildId: interaction.guildId,
                userId: targetUser.id,
            });

            if ( !data ) {
                await interaction.editReply({
                    content: `📭 Użytkownik <@${targetUser.id}> (\`${targetUser.id}\`) **nie posiada** aktywnej zgody na grę w organizacji przestępczej.`
                });
                return;
            }

            const formattedDate = new Date(data.createdAt).toLocaleDateString("pl-PL", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

            const infoEmbed = new EmbedBuilder()
                .setColor(zgpTypeColor(data.zgpType))
                .setTitle(`📋 Szczegóły zgody — ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .setDescription(`Poniżej znajdują się pełne informacje o zgodzie na grę w ZGP dla użytkownika <@${data.userId}>.`)
                .addFields(
                    { name: "📦 Typ zgody", value: `\`${data.zgpType}\``, inline: true },
                    { name: "🔶 Główna grupa", value: `\`${data.mainGroup}\``, inline: true },
                    { name: "👤 Dodał administrator", value: `<@${data.addedBy}>`, inline: false },
                    { name: "🔗 Profil gracza", value: `[Kliknij i przejdź](${data.userLink})`, inline: true },
                    { name: "🔗 Grupa przestępcza", value: `[Kliknij i przejdź](${data.crimeLink})`, inline: true },
                )
                .setFooter({
                    text: `Sprawdzono przez: ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.editReply({
                embeds: [infoEmbed]
            });
        } catch ( error ) {
            logger.error(`Błąd podczas sprawdzania zgody dla ${targetUser.id}: ${error}`);
            await interaction.editReply({
                content: "❌ Wystąpił błąd podczas próby pobrania danych z bazy."
            });
        }
    }
};

function zgpTypeColor(type: string): number {
    switch (type.toUpperCase()) {
        case "LEA":
            return 0x3498db;
        case "RESCUE":
            return 0xe74c3c;
        default:
            return 0x95a5a6;
    }
}