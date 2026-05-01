import {
    ModalSubmitInteraction,
    EmbedBuilder,
    MessageFlags,
    PermissionFlagsBits,
    ChannelType,
    ActionRowBuilder
} from "discord.js";
import { sendToChannel } from "../utils/sendToChannel";
import {logger} from "../utils/logger";
import Strawman from "../models/Strawman";

export const addStrawmanModal = {
    customId: 'addStrawmanModal',

    async execute ( interaction: ModalSubmitInteraction ): Promise<void> {
        if ( interaction.replied || interaction.deferred ) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const strawmanType = interaction.fields.getStringSelectValues('strawmanTypeSelect')[0];
            const itemId = interaction.fields.getTextInputValue('strawmanItemId');
            const forumLink = interaction.fields.getTextInputValue('strawmanForumLink');

            await Strawman.create({
                guildId: interaction.guildId,
                addedBy: interaction.user.id,
                strawmanType,
                itemId,
                forumLink,
            });

            const successEmbed = new EmbedBuilder()
                .setColor(0x57f287)
                .setTitle("✅ Dodano nowego słupa")
                .addFields(
                    { name: "📦 Typ", value: strawmanType, inline: true },
                    { name: "🆔 ID przedmiotu", value: itemId, inline: true },
                    { name: "🔗 Link do forum", value: forumLink },
                )
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });

            const logEmbed = new EmbedBuilder()
                .setColor(0xf8ef0d)
                .setTitle("📋 Nowy wpis słupa")
                .setDescription(`Użytkownik <@${interaction.user.id}> dodał nowy wpis`)
                .addFields(
                    { name: "📦 Typ", value: strawmanType, inline: true },
                    { name: "🆔 ID przedmiotu", value: itemId, inline: true },
                    { name: "🔗 Link do forum", value: forumLink },
                )
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            const logResult = await sendToChannel(interaction.guild, "logChannel", logEmbed);
                if (!logResult.success) {
                    logger.warn(`Brak kanału logów dla serwera ${interaction.guildId}`);
                }
            logger.success(`Dodano słupa w ${interaction.guildId} przez ${interaction.user.id}`);
        } catch ( error ) {
            logger.error(`Błąd podczas dodawania słupa: ${error}`);

            await interaction.editReply({
                content: `❌ Wystąpił błąd podczas dodawania wpisu.`
            });
        }
    }
}